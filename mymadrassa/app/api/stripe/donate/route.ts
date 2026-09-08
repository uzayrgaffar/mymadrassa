import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import {
  DONATION_CURRENCY,
  isDonationFrequency,
  toPence,
} from "@/lib/donations";

/** Fixed id so the product is created once and reused on every later donation. */
const DONATION_PRODUCT_ID = "mymadrassa-monthly-donation";

type DonateRequestBody = {
  amount?: unknown;
  frequency?: unknown;
  name?: unknown;
  email?: unknown;
};

function readString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function ensureDonationProduct(stripe: Stripe) {
  try {
    return await stripe.products.retrieve(DONATION_PRODUCT_ID);
  } catch (error) {
    const isMissing =
      typeof error === "object" &&
      error !== null &&
      (error as Stripe.StripeRawError).code === "resource_missing";

    if (!isMissing) {
      throw error;
    }

    return await stripe.products.create({
      id: DONATION_PRODUCT_ID,
      name: "MyMadrassa monthly donation",
      description: "Recurring monthly support for MyMadrassa.",
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DonateRequestBody;

    const pence = toPence(body.amount);

    if (pence === null) {
      return NextResponse.json(
        { error: "Please enter a donation amount between £1 and £10,000." },
        { status: 400 },
      );
    }

    if (!isDonationFrequency(body.frequency)) {
      return NextResponse.json(
        { error: "Invalid donation frequency." },
        { status: 400 },
      );
    }

    const frequency = body.frequency;
    const name = readString(body.name, 120);
    const email = readString(body.email, 200);

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const stripe = getStripe();

    const metadata = {
      donor_name: name,
      frequency,
      source: "donate_page",
    };

    if (frequency === "once") {
      const intent = await stripe.paymentIntents.create({
        amount: pence,
        currency: DONATION_CURRENCY,
        automatic_payment_methods: { enabled: true },
        description: "MyMadrassa donation",
        receipt_email: email,
        metadata,
      });

      if (!intent.client_secret) {
        throw new Error("Stripe returned no client secret for the payment.");
      }

      return NextResponse.json({ clientSecret: intent.client_secret });
    }

    const product = await ensureDonationProduct(stripe);

    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata,
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price_data: {
            currency: DONATION_CURRENCY,
            product: product.id,
            recurring: { interval: "month" },
            unit_amount: pence,
          },
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.confirmation_secret"],
      metadata,
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice | null;

    const clientSecret = invoice?.confirmation_secret?.client_secret;

    if (!clientSecret) {
      throw new Error(
        "Stripe returned no client secret for the subscription invoice.",
      );
    }

    return NextResponse.json({ clientSecret });
  } catch (error) {
    console.error("Donation intent error:", error);

    return NextResponse.json(
      { error: "We could not start that donation. Please try again." },
      { status: 500 },
    );
  }
}
