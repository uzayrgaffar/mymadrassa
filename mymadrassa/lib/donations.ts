/** Shared between the donate page and the API route so the two never drift. */

export const DONATION_CURRENCY = "gbp";

export const DONATION_CURRENCY_SYMBOL = "£";

export const PRESET_AMOUNTS = [10, 25, 50, 100] as const;

export const MIN_AMOUNT = 1;

export const MAX_AMOUNT = 10000;

export type DonationFrequency = "once" | "monthly";

export function isDonationFrequency(
  value: unknown,
): value is DonationFrequency {
  return value === "once" || value === "monthly";
}

/**
 * Converts a client-supplied amount in pounds to integer pence.
 * Returns null for anything outside the accepted range — the client is never
 * trusted to have validated the amount itself.
 */
export function toPence(amount: unknown): number | null {
  const pounds =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? Number(amount)
        : Number.NaN;

  if (!Number.isFinite(pounds)) {
    return null;
  }

  if (pounds < MIN_AMOUNT || pounds > MAX_AMOUNT) {
    return null;
  }

  const pence = Math.round(pounds * 100);

  if (pence < MIN_AMOUNT * 100) {
    return null;
  }

  return pence;
}

export function formatAmount(pounds: number) {
  const hasFraction = pounds % 1 !== 0;

  return `${DONATION_CURRENCY_SYMBOL}${pounds.toLocaleString("en-GB", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
