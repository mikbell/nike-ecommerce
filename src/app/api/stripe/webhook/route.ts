import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { orders, orderItems, payments } from '@/lib/db/schema';
import { verifyWebhook } from '@/lib/stripe/server';
import Stripe from 'stripe';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');
  
  console.log('Webhook ricevuto:', { 
    hasSignature: !!signature, 
    bodyLength: body.length,
    timestamp: new Date().toISOString()
  });
  
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Per i test in locale, permettiamo di bypassare la verifica della signature
  let event: Stripe.Event;
  
  if (signature && signature !== 'test_signature' && endpointSecret) {
    try {
      event = verifyWebhook(body, signature, endpointSecret);
    } catch (error) {
      console.error('Errore verifica webhook:', error);
      return NextResponse.json({ error: 'Webhook signature non valida' }, { status: 400 });
    }
  } else {
    // Modalità test o sviluppo
    console.log('Modalità test webhook - bypassando verifica signature');
    try {
      event = JSON.parse(body);
    } catch (error) {
      console.error('Errore parsing JSON:', error);
      return NextResponse.json({ error: 'JSON non valido' }, { status: 400 });
    }
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Evento non gestito: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Errore elaborazione webhook:', error);
    return NextResponse.json(
      { error: 'Errore elaborazione evento' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completata:', session.id);

  try {
    const userId = session.metadata?.userId;
    const customerEmail = session.metadata?.customerEmail;
    const cartItems = session.metadata?.cartItems ? JSON.parse(session.metadata.cartItems) : [];

    if (!userId || !cartItems.length) {
      console.error('Dati mancanti nel webhook:', { userId, cartItemsLength: cartItems.length });
      return;
    }

    // Genera numero ordine unico
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

    // Calcola totali
    const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 50 ? 0 : 7.99;
    const tax = subtotal * 0.22; // 22% IVA
    const total = subtotal + shipping + tax;

    // Crea l'ordine
    const [order] = await db.insert(orders).values({
      userId,
      orderNumber,
      status: 'paid',
      totalAmount: total.toFixed(2),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      currency: 'eur',
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string,
      customerEmail: customerEmail || session.customer_details?.email || '',
      customerPhone: session.customer_details?.phone || '',
      shippingAddress: JSON.stringify(session.shipping_details?.address || {}),
      billingAddress: JSON.stringify(session.customer_details?.address || {}),
    }).returning();

    // Crea gli item dell'ordine
    const orderItemsData = cartItems.map((item: any) => ({
      orderId: order.id,
      productVariantId: item.variantId,
      quantity: item.quantity,
      priceAtPurchase: item.price.toFixed(2),
    }));

    await db.insert(orderItems).values(orderItemsData);

    // Crea il record di pagamento
    await db.insert(payments).values({
      orderId: order.id,
      method: 'stripe',
      status: 'completed',
      paidAt: new Date(),
      transactionId: session.payment_intent as string,
      stripePaymentIntentId: session.payment_intent as string,
      stripeSessionId: session.id,
      amount: (total * 100).toString(), // In centesimi
      currency: 'eur',
      stripeWebhookEventId: session.id,
    });

    console.log('Ordine creato con successo:', order.id);

    // TODO: Inviare email di conferma ordine
    // TODO: Aggiornare inventario prodotti
    
  } catch (error) {
    console.error('Errore creazione ordine:', error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent riuscito:', paymentIntent.id);

  try {
    // Aggiorna lo stato del pagamento se esiste
    await db
      .update(payments)
      .set({
        status: 'completed',
        paidAt: new Date(),
      })
      .where(eq(payments.stripePaymentIntentId, paymentIntent.id));

    // Aggiorna lo stato dell'ordine
    await db
      .update(orders)
      .set({
        status: 'paid',
        updatedAt: new Date(),
      })
      .where(eq(orders.stripePaymentIntentId, paymentIntent.id));

  } catch (error) {
    console.error('Errore aggiornamento payment intent:', error);
    throw error;
  }
}