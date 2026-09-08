import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import RegisterForm from "./RegisterForm";
import { isTrack, trackCopy } from "@/lib/registration";

export function generateStaticParams() {
  return [{ track: "individual" }, { track: "group" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string }>;
}): Promise<Metadata> {
  const { track } = await params;

  if (!isTrack(track)) {
    return { title: "Register — MyMadrassa" };
  }

  return {
    title: `${trackCopy[track].eyebrow} — MyMadrassa`,
    description: trackCopy[track].intro,
  };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;

  if (!isTrack(track)) {
    notFound();
  }

  const copy = trackCopy[track];

  const other = track === "individual" ? "group" : "individual";

  return (
    <div className="min-h-screen bg-warm text-ink">
      <Navbar />

      <section className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <Link
          href="/#courses"
          className="text-sm font-semibold text-muted hover:text-ink transition-colors mb-8 inline-block"
        >
          ← Back to study formats
        </Link>

        <p className="eyebrow-line text-accent text-sm font-bold uppercase tracking-widest mb-6">
          {copy.eyebrow}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-ink leading-tight tracking-tight mb-6">
          {copy.title}
        </h1>
        <p className="text-muted text-lg leading-relaxed mb-4 max-w-2xl">
          {copy.intro}
        </p>
        <p className="text-muted text-sm mb-12">
          Looking for the other format?{" "}
          <Link
            href={`/register/${other}`}
            className="text-ink font-semibold underline underline-offset-4 hover:text-accent transition-colors"
          >
            {trackCopy[other].eyebrow} →
          </Link>
        </p>

        <Suspense
          fallback={
            <div className="bg-white border border-line rounded-3xl h-96" />
          }
        >
          <RegisterForm track={track} />
        </Suspense>
      </section>
    </div>
  );
}
