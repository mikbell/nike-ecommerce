import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, productVariants, products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID richiesto' },
        { status: 400 }
      );
    }

    // Recupera l'ordine con i suoi items e i dettagli dei prodotti
    const orderWithItems = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        totalAmount: orders.totalAmount,
        subtotal: orders.subtotal,
        tax: orders.tax,
        shipping: orders.shipping,
        currency: orders.currency,
        customerEmail: orders.customerEmail,
        customerPhone: orders.customerPhone,
        shippingAddress: orders.shippingAddress,
        billingAddress: orders.billingAddress,
        createdAt: orders.createdAt,
        // Item details
        itemId: orderItems.id,
        quantity: orderItems.quantity,
        priceAtPurchase: orderItems.priceAtPurchase,
        // Product details
        productName: products.name,
        variantName: productVariants.name,
        variantSku: productVariants.sku,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
      .leftJoin(products, eq(productVariants.productId, products.id))
      .where(eq(orders.stripeSessionId, sessionId))
      .limit(1);

    if (!orderWithItems.length) {
      return NextResponse.json(
        { error: 'Ordine non trovato' },
        { status: 404 }
      );
    }

    // Raggruppa i dati dell'ordine
    const orderData = orderWithItems[0];
    const items = orderWithItems
      .filter(item => item.itemId) // Filtra items nulli
      .map(item => ({
        id: item.itemId,
        productName: item.productName || 'Prodotto sconosciuto',
        variantName: item.variantName || 'Variante sconosciuta',
        variantSku: item.variantSku || '',
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
      }));

    const result = {
      id: orderData.id,
      orderNumber: orderData.orderNumber,
      status: orderData.status,
      totalAmount: orderData.totalAmount,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      shipping: orderData.shipping,
      currency: orderData.currency,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      shippingAddress: orderData.shippingAddress ? JSON.parse(orderData.shippingAddress) : null,
      billingAddress: orderData.billingAddress ? JSON.parse(orderData.billingAddress) : null,
      createdAt: orderData.createdAt,
      items,
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Errore recupero ordine:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}