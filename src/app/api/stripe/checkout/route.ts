import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/actions';
import { createCheckoutSession } from '@/lib/stripe/server';
import { getSuccessUrl, getCancelUrl } from '@/lib/stripe/config';
import { CartItem } from '@/lib/types/cart';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const body = await request.json();
    const { items, customerInfo }: { items: CartItem[], customerInfo: any } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Nessun articolo nel carrello' },
        { status: 400 }
      );
    }

    // Converti gli items del carrello in formato per Stripe
    const stripeItems = items.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      images: [item.imageUrl],
    }));

    // Genera un session ID univoco per il success URL
    const sessionId = `{CHECKOUT_SESSION_ID}`;
    
    // Crea la sessione di checkout Stripe
    const session = await createCheckoutSession(stripeItems, {
      userId: user.id,
      customerEmail: user.email,
      successUrl: getSuccessUrl(sessionId),
      cancelUrl: getCancelUrl(),
      metadata: {
        userId: user.id,
        customerEmail: user.email,
        customerName: user.name,
        itemsCount: items.length.toString(),
        // Serializza gli items per il webhook
        cartItems: JSON.stringify(items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        }))),
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Errore creazione sessione checkout:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}