import Stripe from "stripe";

let client: Stripe | null = null;

/**
 * Created lazily so a missing key fails the individual request rather than
 * the whole build — the donate page still renders without Stripe configured.
 */
export function getStripe(): Stripe {
  if (client) {
    return client;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  client = new Stripe(secretKey);

  return client;
}
