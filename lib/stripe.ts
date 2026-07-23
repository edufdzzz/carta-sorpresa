import Stripe from "stripe";

export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // El cliente HTTP basado en Node falla en el runtime de funciones de
    // Netlify; el basado en fetch funciona en cualquier entorno serverless.
    httpClient: Stripe.createFetchHttpClient(),
  });
}
