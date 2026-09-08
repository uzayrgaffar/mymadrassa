"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import Navbar from "@/components/Navbar";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

type Outcome = {
  title: string;
  body: string;
  tone: "success" | "pending" | "error";
};

const outcomes: Record<string, Outcome> = {
  succeeded: {
    title: "Jazakum Allahu khayran.",
    body: "Your donation went through and a receipt is on its way to your inbox. May Allah accept it from you.",
    tone: "success",
  },
  processing: {
    title: "Your donation is processing.",
    body: "Your bank is still confirming the payment. We will email your receipt as soon as it clears.",
    tone: "pending",
  },
  requires_payment_method: {
    title: "That payment did not go through.",
    body: "Your card was not charged. Please try again with another payment method.",
    tone: "error",
  },
};

const fallbackOutcome: Outcome = {
  title: "We could not confirm that donation.",
  body: "If you were charged, the receipt will still reach your inbox. Please get in touch if anything looks wrong.",
  tone: "error",
};

function ThankYouContent() {
  const searchParams = useSearchParams();

  const clientSecret = searchParams.get("payment_intent_client_secret");

  // Nothing to look up without a client secret, so start on the fallback.
  const [outcome, setOutcome] = useState<Outcome | null>(
    clientSecret && stripePromise ? null : fallbackOutcome,
  );

  useEffect(() => {
    if (!clientSecret || !stripePromise) {
      return;
    }

    let cancelled = false;

    stripePromise
      .then((stripe) => stripe?.retrievePaymentIntent(clientSecret))
      .then((result) => {
        if (cancelled) {
          return;
        }

        const status = result?.paymentIntent?.status;

        setOutcome((status && outcomes[status]) || fallbackOutcome);
      })
      .catch(() => {
        if (!cancelled) {
          setOutcome(fallbackOutcome);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clientSecret]);

  if (!outcome) {
    return <p className="text-muted text-lg">Confirming your donation…</p>;
  }

  return (
    <div>
      <p className="eyebrow-line text-accent text-sm font-bold uppercase tracking-widest mb-6">
        {outcome.tone === "success" ? "Donation received" : "Donation status"}
      </p>
      <h1 className="text-5xl md:text-6xl font-bold text-ink leading-tight tracking-tight mb-6">
        {outcome.title}
      </h1>
      <p className="text-muted text-lg leading-relaxed mb-12 max-w-2xl">
        {outcome.body}
      </p>
      <div className="flex flex-wrap items-center gap-5">
        <Link
          href="/"
          className="bg-sidebar text-white font-bold px-8 py-4 rounded-2xl text-base hover:opacity-90 transition-opacity shadow-sm hover:shadow-md"
        >
          Back to home
        </Link>
        {outcome.tone === "error" && (
          <Link
            href="/donate"
            className="text-ink font-semibold text-base underline underline-offset-4 hover:text-accent transition-colors"
          >
            Try again →
          </Link>
        )}
      </div>
    </div>
  );
}

export default function DonateThankYouPage() {
  return (
    <div className="min-h-screen bg-warm text-ink">
      <Navbar />
      <section className="max-w-3xl mx-auto px-6 md:px-8 py-20 md:py-28">
        <Suspense
          fallback={
            <p className="text-muted text-lg">Confirming your donation…</p>
          }
        >
          <ThankYouContent />
        </Suspense>
      </section>
    </div>
  );
}
