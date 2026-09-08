"use client";

import { FormEvent, useState } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

type DonationPaymentFormProps = {
  /** e.g. "£50 every month" — shown above the card fields. */
  summary: string;
  onBack: () => void;
};

export default function DonationPaymentForm({
  summary,
  onBack,
}: DonationPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/donate/thank-you`,
      },
    });

    // Reached only when confirmation fails — success redirects to return_url.
    setError(
      result.error.message ??
        "We could not take that payment. Please try again.",
    );

    setSubmitting(false);
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-line">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">
            You are giving
          </p>
          <p className="text-2xl font-bold text-ink">{summary}</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-muted text-sm font-semibold underline underline-offset-4 hover:text-ink transition-colors shrink-0"
        >
          Change
        </button>
      </div>

      <PaymentElement onReady={() => setReady(true)} />

      {error && (
        <p className="text-red-700 text-sm mt-6" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || !ready || submitting}
        className="w-full mt-8 bg-sidebar text-white font-bold py-4 rounded-2xl text-base hover:opacity-90 transition-opacity shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Processing…" : `Give ${summary}`}
      </button>

      <p className="text-center text-muted text-xs mt-4">
        Payments are processed securely by Stripe. Your card details never touch
        our servers.
      </p>
    </form>
  );
}
