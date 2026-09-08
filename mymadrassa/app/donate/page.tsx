import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import DonateForm from "./DonateForm";

export const metadata: Metadata = {
  title: "Donate — MyMadrassa",
  description:
    "Support MyMadrassa with a one-off or monthly donation. Your sadaqah trains teachers and keeps our doors open.",
};

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-warm text-ink">
      <Navbar />

      <section className="max-w-3xl mx-auto px-6 md:px-8 py-20 md:py-28">
        <p className="eyebrow-line text-accent text-sm font-bold uppercase tracking-widest mb-6">
          Support our institute
        </p>
        <h1 className="text-5xl md:text-6xl font-bold text-ink leading-tight tracking-tight mb-6">
          Invest in a lasting sadaqah.
        </h1>
        <p className="text-muted text-lg leading-relaxed mb-12 max-w-2xl">
          Your contribution helps train our next generation of teachers, keeps
          our doors open to those who could never reach us, and funds the
          activities that keep our institute running.
        </p>

        <Suspense
          fallback={
            <div className="bg-white border border-line rounded-3xl shadow-sm p-8 md:p-12 h-96" />
          }
        >
          <DonateForm />
        </Suspense>
      </section>
    </div>
  );
}
