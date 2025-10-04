import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, productVariants, products } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
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

    const body = await request.json();
    const { 
      shippingInfo, 
      items, 
      subtotal, 
      tax, 
      shipping, 
      totalAmount 
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Carrello vuoto' },
        { status: 400 }
      );
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

    const [order] = await db.insert(orders).values({
      userId: user.id,
      orderNumber,
      status: 'pending',
      totalAmount: totalAmount.toFixed(2),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      currency: 'eur',
      customerEmail: shippingInfo.email,
      customerPhone: shippingInfo.phone || '',
      shippingAddress: JSON.stringify({
        firstName: shippingInfo.firstName,
        lastName: shippingInfo.lastName,
        address: shippingInfo.address,
        city: shippingInfo.city,
        postalCode: shippingInfo.postalCode,
        country: shippingInfo.country,
      }),
      notes: shippingInfo.notes || '',
    }).returning();

    const orderItemsData = items.map((item: { variantId: string; quantity: number; price: number }) => ({
      orderId: order.id,
      productVariantId: item.variantId,
      quantity: item.quantity,
      priceAtPurchase: item.price.toFixed(2),
    }));

    await db.insert(orderItems).values(orderItemsData);

    return NextResponse.json({ 
      success: true, 
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
      }
    });

  } catch (error) {
    console.error('Errore creazione ordine:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    // Recupera gli ordini dell'utente con i dettagli dei prodotti
    const userOrdersWithItems = await db
      .select({
        // Order data
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        totalAmount: orders.totalAmount,
        subtotal: orders.subtotal,
        tax: orders.tax,
        shipping: orders.shipping,
        currency: orders.currency,
        createdAt: orders.createdAt,
        // Item data
        itemId: orderItems.id,
        quantity: orderItems.quantity,
        priceAtPurchase: orderItems.priceAtPurchase,
        // Product data
        productName: products.name,
        variantName: productVariants.name,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
      .leftJoin(products, eq(productVariants.productId, products.id))
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt));

    // Raggruppa i dati per ordine
    const ordersMap = new Map();

    userOrdersWithItems.forEach((row) => {
      const orderId = row.id;
      
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          id: row.id,
          orderNumber: row.orderNumber,
          status: row.status,
          totalAmount: row.totalAmount,
          subtotal: row.subtotal,
          tax: row.tax,
          shipping: row.shipping,
          currency: row.currency,
          createdAt: row.createdAt,
          items: [],
        });
      }

      // Aggiungi l'item se esiste
      if (row.itemId) {
        ordersMap.get(orderId).items.push({
          id: row.itemId,
          productName: row.productName || 'Prodotto sconosciuto',
          variantName: row.variantName || 'Variante sconosciuta',
          quantity: row.quantity,
          priceAtPurchase: row.priceAtPurchase,
        });
      }
    });

    // Converti in array e calcola il conteggio degli item
    const ordersArray = Array.from(ordersMap.values()).map(order => ({
      ...order,
      itemCount: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    }));

    return NextResponse.json(ordersArray);

  } catch (error) {
    console.error('Errore recupero ordini:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
