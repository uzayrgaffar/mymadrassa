"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import DonationPaymentForm from "./DonationPaymentForm";
import {
  DONATION_CURRENCY_SYMBOL,
  MAX_AMOUNT,
  MIN_AMOUNT,
  PRESET_AMOUNTS,
  formatAmount,
  type DonationFrequency,
} from "@/lib/donations";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

/** Matches the site's warm palette so the card fields do not look bolted on. */
const appearance: Appearance = {
  theme: "flat",
  variables: {
    colorPrimary: "#C9A44A",
    colorBackground: "#FFFFFF",
    colorText: "#1C1917",
    colorTextSecondary: "#7A6650",
    colorDanger: "#B91C1C",
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    borderRadius: "12px",
  },
  rules: {
    ".Input": {
      border: "1px solid #E3D8CA",
      boxShadow: "none",
      padding: "12px",
    },
    ".Input:focus": {
      border: "1px solid #C9A44A",
      boxShadow: "none",
    },
    ".Label": {
      color: "#7A6650",
      fontWeight: "600",
    },
    ".Tab": {
      border: "1px solid #E3D8CA",
      boxShadow: "none",
    },
    ".Tab--selected": {
      border: "1px solid #C9A44A",
      boxShadow: "none",
    },
  },
};

const frequencies: Array<{
  value: DonationFrequency;
  label: string;
  hint: string;
}> = [
  { value: "once", label: "One-off", hint: "A single gift" },
  { value: "monthly", label: "Monthly", hint: "Cancel any time" },
];

export default function DonateForm() {
  // The landing page links to /donate?give=monthly for "Give monthly".
  const searchParams = useSearchParams();

  const [frequency, setFrequency] = useState<DonationFrequency>(
    searchParams.get("give") === "monthly" ? "monthly" : "once",
  );
  const [preset, setPreset] = useState<number | null>(PRESET_AMOUNTS[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = useMemo(() => {
    if (customAmount.trim()) {
      const parsed = Number(customAmount);

      return Number.isFinite(parsed) ? parsed : null;
    }

    return preset;
  }, [customAmount, preset]);

  const amountIsValid =
    amount !== null && amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;

  const summary =
    amount !== null
      ? frequency === "monthly"
        ? `${formatAmount(amount)} a month`
        : formatAmount(amount)
      : "";

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!amountIsValid) {
      setError(
        `Please choose an amount between ${DONATION_CURRENCY_SYMBOL}${MIN_AMOUNT} and ${formatAmount(MAX_AMOUNT)}.`,
      );

      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, frequency, name, email }),
      });

      const data = (await response.json()) as {
        clientSecret?: string;
        error?: string;
      };

      if (!response.ok || !data.clientSecret) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);

        return;
      }

      setClientSecret(data.clientSecret);
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setSubmitting(false);
  };

  const onBack = () => {
    setClientSecret(null);
    setError(null);
  };

  return (
    <div
      id="monthly"
      className="bg-white border border-line rounded-3xl shadow-sm p-8 md:p-12 scroll-mt-24"
    >
      {!publishableKey ? (
        <div>
          <h2 className="text-2xl font-bold text-ink mb-3">
            Donations are not live yet
          </h2>
          <p className="text-muted text-base leading-relaxed">
            Stripe has not been configured for this site. Please check back
            shortly, or{" "}
            <Link
              href="/book-free-call"
              className="text-ink font-semibold underline underline-offset-4 hover:text-accent transition-colors"
            >
              get in touch
            </Link>{" "}
            if you would like to give another way.
          </p>
        </div>
      ) : clientSecret ? (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret, appearance }}
        >
          <DonationPaymentForm summary={summary} onBack={onBack} />
        </Elements>
      ) : (
        <form onSubmit={onSubmit}>
          <fieldset className="mb-8">
            <legend className="text-xs font-bold uppercase tracking-widest text-muted mb-4">
              How often
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {frequencies.map((option) => {
                const active = frequency === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFrequency(option.value)}
                    aria-pressed={active}
                    className={`rounded-2xl border p-4 text-left transition-colors ${
                      active
                        ? "border-accent bg-warm"
                        : "border-line hover:border-accent/50"
                    }`}
                  >
                    <span className="block font-bold text-ink text-base">
                      {option.label}
                    </span>
                    <span className="block text-muted text-xs mt-0.5">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mb-8">
            <legend className="text-xs font-bold uppercase tracking-widest text-muted mb-4">
              Amount
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {PRESET_AMOUNTS.map((value) => {
                const active = !customAmount.trim() && preset === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setPreset(value);
                      setCustomAmount("");
                    }}
                    aria-pressed={active}
                    className={`rounded-2xl border py-3 font-bold text-ink transition-colors ${
                      active
                        ? "border-accent bg-warm"
                        : "border-line hover:border-accent/50"
                    }`}
                  >
                    {formatAmount(value)}
                  </button>
                );
              })}
            </div>
            <label className="block">
              <span className="sr-only">Custom amount in pounds</span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-semibold">
                  {DONATION_CURRENCY_SYMBOL}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  step="0.01"
                  value={customAmount}
                  onChange={(event) =>
                    setCustomAmount(event.target.value)
                  }
                  placeholder="Other amount"
                  className="w-full rounded-2xl border border-line bg-white pl-9 pr-4 py-3 text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
                />
              </div>
            </label>
          </fieldset>

          <fieldset className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <legend className="text-xs font-bold uppercase tracking-widest text-muted mb-4">
              Your details
            </legend>
            <label className="block">
              <span className="block text-sm font-semibold text-muted mb-2">
                Full name
              </span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-ink focus:border-accent focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-muted mb-2">
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-ink focus:border-accent focus:outline-none"
              />
            </label>
            <p className="text-muted text-xs sm:col-span-2">
              We use your email to send the receipt
              {frequency === "monthly"
                ? " and to manage your monthly giving."
                : "."}
            </p>
          </fieldset>

          {error && (
            <p className="text-red-700 text-sm mb-6" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !amountIsValid}
            className="w-full bg-sidebar text-white font-bold py-4 rounded-2xl text-base hover:opacity-90 transition-opacity shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Preparing…" : `Continue to payment →`}
          </button>

          <p className="text-center text-muted text-xs mt-4">
            {summary
              ? frequency === "monthly"
                ? `${summary}, cancel any time.`
                : `A one-off gift of ${summary}.`
              : "Choose an amount to continue."}
          </p>
        </form>
  )}
    </div>
  );
}
