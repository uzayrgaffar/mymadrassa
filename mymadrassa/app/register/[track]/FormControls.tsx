"use client";

import { ReactNode } from "react";

export function Section({
  index,
  title,
  hint,
  accent = false,
  children,
}: {
  index: number;
  title: string;
  hint?: string;
  /** Highlights sections that appear conditionally, so they read as deliberate. */
  accent?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-3xl border p-6 md:p-8 ${
        accent ? "border-accent bg-accent/[0.04]" : "border-line bg-white"
      }`}
    >
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-accent font-bold text-sm tabular-nums">
          {String(index).padStart(2, "0")}
        </span>
        <h2 className="text-xl font-bold text-ink">{title}</h2>
      </div>
      {hint && (
        <p className="text-muted text-sm leading-relaxed mb-6 md:pl-8">
          {hint}
        </p>
      )}
      <div className={`space-y-5 ${hint ? "" : "mt-6"} md:pl-8`}>{children}</div>
    </section>
  );
}

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <span className="block text-sm font-semibold text-ink mb-2">{label}</span>
      {hint && <p className="text-muted text-xs mb-2">{hint}</p>}
      {children}
      {error && <p className="text-red-700 text-xs mt-2">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent transition-colors";

export function TextInput({
  value,
  onChange,
  ...rest
}: {
  value: string;
  onChange: (value: string) => void;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
>) {
  return (
    <input
      {...rest}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
    />
  );
}

export function TextArea({
  value,
  onChange,
  ...rest
}: {
  value: string;
  onChange: (value: string) => void;
} & Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
>) {
  return (
    <textarea
      {...rest}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`${inputClass} resize-y min-h-28`}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Please choose…",
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`${inputClass} appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%237A6650'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")",
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

/** Radio group rendered as cards — used where the choice shapes the rest of the form. */
export function ChoiceCards({
  value,
  onChange,
  options,
  columns = 1,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; hint?: string }>;
  columns?: 1 | 2 | 3;
}) {
  const grid =
    columns === 3
      ? "sm:grid-cols-3"
      : columns === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-1";

  return (
    <div className={`grid grid-cols-1 ${grid} gap-3`}>
      {options.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={`rounded-2xl border p-4 text-left transition-colors ${
              active
                ? "border-accent bg-warm"
                : "border-line bg-white hover:border-accent/50"
            }`}
          >
            <span className="block font-bold text-ink text-[15px] leading-snug">
              {option.label}
            </span>
            {option.hint && (
              <span className="block text-muted text-xs mt-1 leading-relaxed">
                {option.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Multi-select rendered as chips — for days and time windows. */
export function ChipGroup({
  values,
  onToggle,
  options,
}: {
  values: string[];
  onToggle: (option: string) => void;
  options: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = values.includes(option);

        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            aria-pressed={active}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              active
                ? "border-accent bg-accent text-white"
                : "border-line bg-white text-muted hover:border-accent/50 hover:text-ink"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
