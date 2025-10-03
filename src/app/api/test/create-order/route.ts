import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, payments } from '@/lib/db/schema';
import { getUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    console.log('Creating test order for user:', user.id);

    // Genera numero ordine unico
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
    
    // Dati di test
    const testData = {
      subtotal: 99.99,
      shipping: 7.99,
      tax: 21.99,
      total: 129.97,
    };

    // Crea l'ordine di test
    const [order] = await db.insert(orders).values({
      userId: user.id,
      orderNumber,
      status: 'paid',
      totalAmount: testData.total.toFixed(2),
      subtotal: testData.subtotal.toFixed(2),
      tax: testData.tax.toFixed(2),
      shipping: testData.shipping.toFixed(2),
      currency: 'eur',
      stripeSessionId: `cs_test_${Date.now()}`,
      stripePaymentIntentId: `pi_test_${Date.now()}`,
      customerEmail: user.email,
      customerPhone: '+39 123 456 7890',
      shippingAddress: JSON.stringify({
        line1: 'Via Roma 123',
        city: 'Milano',
        postal_code: '20100',
        country: 'IT'
      }),
      billingAddress: JSON.stringify({
        line1: 'Via Roma 123',
        city: 'Milano',
        postal_code: '20100',
        country: 'IT'
      }),
    }).returning();

    console.log('Order created:', order);

    // Trova una variante prodotto esistente per il test
    const { productVariants } = await import('@/lib/db/schema');
    const variants = await db.select().from(productVariants).limit(1);
    
    if (variants.length > 0) {
      // Crea gli item dell'ordine
      await db.insert(orderItems).values({
        orderId: order.id,
        productVariantId: variants[0].id,
        quantity: 1,
        priceAtPurchase: '99.99',
      });

      console.log('Order items created');
    }

    // Crea il record di pagamento
    await db.insert(payments).values({
      orderId: order.id,
      method: 'stripe',
      status: 'completed',
      paidAt: new Date(),
      transactionId: `pi_test_${Date.now()}`,
      stripePaymentIntentId: `pi_test_${Date.now()}`,
      stripeSessionId: `cs_test_${Date.now()}`,
      amount: (testData.total * 100).toString(),
      currency: 'eur',
      stripeWebhookEventId: `evt_test_${Date.now()}`,
    });

    console.log('Payment record created');

    return NextResponse.json({ 
      success: true, 
      order,
      message: 'Ordine di test creato con successo'
    });

  } catch (error) {
    console.error('Errore creazione ordine test:', error);
    return NextResponse.json(
      { error: 'Errore interno del server', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}