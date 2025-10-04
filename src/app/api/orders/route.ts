import { NextRequest } from 'next/server';
import { z } from 'zod';
import { 
  withErrorHandling, 
  withValidation,
  withRateLimit,
  createResponse,
  composeMiddleware,
  ValidationError,
  NotFoundError,
} from '@/lib/api';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/actions';
import { eq, desc } from 'drizzle-orm';

// === Validation Schemas ===
const ShippingInfoSchema = z.object({
  email: z.string().email('Email non valida'),
  firstName: z.string().min(1, 'Nome obbligatorio'),
  lastName: z.string().min(1, 'Cognome obbligatorio'),
  phone: z.string().optional(),
  address: z.string().min(1, 'Indirizzo obbligatorio'),
  city: z.string().min(1, 'Città obbligatoria'),
  state: z.string().optional(),
  postalCode: z.string().regex(/^\d{5}$/, 'CAP deve essere di 5 cifre'),
  country: z.string().min(1, 'Paese obbligatorio'),
  saveInfo: z.boolean().optional().default(false),
  newsletter: z.boolean().optional().default(false),
});

const OrderItemSchema = z.object({
  productId: z.string().uuid('ID prodotto non valido'),
  variantId: z.string().uuid('ID variante non valido'),
  quantity: z.number().int().min(1, 'Quantità deve essere almeno 1').max(10, 'Quantità massima superata'),
  price: z.number().positive('Prezzo deve essere positivo'),
});

const CreateOrderSchema = z.object({
  shippingInfo: ShippingInfoSchema,
  items: z.array(OrderItemSchema).min(1, 'Almeno un articolo richiesto'),
  totalAmount: z.number().positive('Totale deve essere positivo'),
  subtotal: z.number().positive().optional(),
  tax: z.number().nonnegative().optional(),
  shipping: z.number().nonnegative().optional(),
});

type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// === Helper Functions ===
function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

async function validateOrderItems(items: CreateOrderInput['items']) {
  // TODO: In a real application, validate that:
  // 1. Products exist and are available
  // 2. Variants exist for the products
  // 3. Quantities are within stock limits
  // 4. Prices match current prices
  
  // For now, we'll just ensure the data structure is correct
  return items.every(item => 
    item.productId && 
    item.variantId && 
    item.quantity > 0 && 
    item.price > 0
  );
}

// === API Handlers ===
async function handleCreateOrder(
  request: NextRequest,
  { body }: { body: CreateOrderInput }
) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new ValidationError('Utente non autenticato');
  }

  // Validate order items
  const itemsValid = await validateOrderItems(body.items);
  if (!itemsValid) {
    throw new ValidationError('Articoli dell\'ordine non validi');
  }

  // Calculate totals (in a real app, recalculate server-side)
  const calculatedSubtotal = body.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const calculatedTax = calculatedSubtotal * 0.22; // 22% IVA
  const calculatedShipping = calculatedSubtotal >= 50 ? 0 : 7.99;
  const calculatedTotal = calculatedSubtotal + calculatedTax + calculatedShipping;

  // Validate total matches calculation (allow small rounding differences)
  if (Math.abs(body.totalAmount - calculatedTotal) > 0.01) {
    throw new ValidationError('Totale ordine non corretto');
  }

  const orderNumber = generateOrderNumber();

  try {
    // Create order
    const [order] = await db.insert(orders).values({
      userId: user.id,
      orderNumber,
      status: 'pending',
      totalAmount: body.totalAmount.toFixed(2),
      subtotal: calculatedSubtotal.toFixed(2),
      tax: calculatedTax.toFixed(2),
      shipping: calculatedShipping.toFixed(2),
      currency: 'EUR',
      customerEmail: body.shippingInfo.email,
      customerPhone: body.shippingInfo.phone || '',
      shippingAddress: JSON.stringify({
        firstName: body.shippingInfo.firstName,
        lastName: body.shippingInfo.lastName,
        address: body.shippingInfo.address,
        city: body.shippingInfo.city,
        state: body.shippingInfo.state,
        postalCode: body.shippingInfo.postalCode,
        country: body.shippingInfo.country,
      }),
      notes: '',
    }).returning();

    // Create order items
    const orderItemsData = body.items.map(item => ({
      orderId: order.id,
      productVariantId: item.variantId,
      quantity: item.quantity,
      priceAtPurchase: item.price.toFixed(2),
    }));

    await db.insert(orderItems).values(orderItemsData);

    return createResponse(
      {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          status: order.status,
        },
      },
      { 
        status: 201,
        message: 'Ordine creato con successo' 
      }
    );

  } catch (error) {
    console.error('Database error creating order:', error);
    throw new ValidationError('Errore durante la creazione dell\'ordine');
  }
}

async function handleGetOrders(request: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new ValidationError('Utente non autenticato');
  }

  try {
    // Get user orders with items
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
        productVariantId: orderItems.productVariantId,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt));

    // Group data by order
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

      // Add item if exists
      if (row.itemId) {
        ordersMap.get(orderId).items.push({
          id: row.itemId,
          productVariantId: row.productVariantId,
          quantity: row.quantity,
          priceAtPurchase: row.priceAtPurchase,
        });
      }
    });

    // Convert to array and calculate item count
    const ordersArray = Array.from(ordersMap.values()).map(order => ({
      ...order,
      itemCount: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    }));

    return createResponse(ordersArray, {
      message: `Trovati ${ordersArray.length} ordini`
    });

  } catch (error) {
    console.error('Database error getting orders:', error);
    throw new ValidationError('Errore durante il recupero degli ordini');
  }
}

// === Export with Middleware ===
export const POST = composeMiddleware(
  withRateLimit({ maxRequests: 5, windowMs: 60 * 1000 }), // 5 orders per minute
  withValidation({ bodySchema: CreateOrderSchema }),
  withErrorHandling
)(handleCreateOrder);

export const GET = composeMiddleware(
  withRateLimit({ maxRequests: 20, windowMs: 60 * 1000 }),
  withErrorHandling
)(handleGetOrders);

// === Route Config ===
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';