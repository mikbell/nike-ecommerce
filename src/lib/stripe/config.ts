import { loadStripe, Stripe } from '@stripe/stripe-js';

// Configurazione Stripe lato client
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export { stripePromise };

// Configurazione per server-side (non esportare la secret key)
export const stripeConfig = {
  currency: 'eur',
  locale: 'it',
  // Metadati standard per tutti i pagamenti
  defaultMetadata: {
    source: 'nike-ecommerce-app'
  }
};

// Helper per ottenere Stripe instance lato client
export const getStripe = async (): Promise<Stripe | null> => {
  return await stripePromise;
};

// URL di reindirizzamento dopo pagamento
export const getSuccessUrl = (sessionId: string) => 
  `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order-confirmation?session_id=${sessionId}`;

export const getCancelUrl = () => 
  `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout?canceled=true`;