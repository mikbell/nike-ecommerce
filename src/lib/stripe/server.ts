import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY non trovata nelle variabili di ambiente');
}

// Istanza Stripe per server-side
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
});

// Helper per creare un checkout session
export const createCheckoutSession = async (
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    images?: string[];
  }>,
  options: {
    userId?: string;
    customerEmail?: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }
) => {
  const { userId, customerEmail, successUrl, cancelUrl, metadata = {} } = options;

  // Converti gli items in line_items di Stripe
  const lineItems = items.map(item => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.name,
        images: item.images || [],
      },
      unit_amount: Math.round(item.price * 100), // Stripe usa centesimi
    },
    quantity: item.quantity,
  }));

  const sessionData: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: userId || '',
      ...metadata,
    },
    shipping_address_collection: {
      allowed_countries: ['IT', 'ES', 'FR', 'DE'],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: 0,
            currency: 'eur',
          },
          display_name: 'Spedizione gratuita',
          delivery_estimate: {
            minimum: {
              unit: 'business_day',
              value: 2,
            },
            maximum: {
              unit: 'business_day',
              value: 5,
            },
          },
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: 999, // €9.99
            currency: 'eur',
          },
          display_name: 'Spedizione espressa',
          delivery_estimate: {
            minimum: {
              unit: 'business_day',
              value: 1,
            },
            maximum: {
              unit: 'business_day',
              value: 2,
            },
          },
        },
      },
    ],
    allow_promotion_codes: true,
    billing_address_collection: 'required',
  };

  // Aggiungi customer email se fornita
  if (customerEmail) {
    sessionData.customer_email = customerEmail;
  }

  return await stripe.checkout.sessions.create(sessionData);
};

// Helper per verificare un webhook di Stripe
export const verifyWebhook = (
  body: string,
  signature: string,
  endpointSecret: string
) => {
  return stripe.webhooks.constructEvent(body, signature, endpointSecret);
};

// Helper per recuperare una sessione di checkout
export const retrieveCheckoutSession = async (sessionId: string) => {
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'customer', 'payment_intent'],
  });
};