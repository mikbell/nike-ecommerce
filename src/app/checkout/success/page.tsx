'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, Package, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useCartStore } from '@/lib/stores/cart-store';

interface OrderDetails {
  id: string;
  orderNumber: string;
  totalAmount: string;
  status: string;
  customerEmail: string;
  createdAt: string;
  items: Array<{
    productName: string;
    variantName: string;
    quantity: number;
    priceAtPurchase: string;
  }>;
}

export default function CheckoutSuccessPage() {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCartStore();

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      router.push('/');
      return;
    }

    // Svuota il carrello dopo il pagamento riuscito
    clearCart();
    fetchOrderDetails();
  }, [sessionId, router, clearCart]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/by-session?session_id=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      }
    } catch (error) {
      console.error('Errore recupero ordine:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Caricamento dettagli ordine...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Ordine non trovato</h1>
            <p className="text-gray-600 mb-6">
              Non siamo riusciti a trovare i dettagli del tuo ordine.
            </p>
            <Button asChild>
              <Link href="/">Torna alla home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header di conferma */}
      <Card className="mb-6">
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pagamento completato!
          </h1>
          <p className="text-gray-600">
            Grazie per il tuo acquisto. Il tuo ordine è stato confermato.
          </p>
        </CardContent>
      </Card>

      {/* Dettagli ordine */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Riepilogo ordine
          </CardTitle>
          <CardDescription>
            Ordine #{orderDetails.orderNumber}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status e data */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              {new Date(orderDetails.createdAt).toLocaleDateString('it-IT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {orderDetails.status === 'paid' ? 'Pagato' : orderDetails.status}
            </span>
          </div>

          <Separator />

          {/* Items dell'ordine */}
          <div className="space-y-3">
            <h4 className="font-medium">Prodotti ordinati:</h4>
            {orderDetails.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-gray-600">{item.variantName}</p>
                  <p className="text-sm text-gray-600">Quantità: {item.quantity}</p>
                </div>
                <p className="font-medium">€{item.priceAtPurchase}</p>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totale */}
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Totale:</span>
            <span>€{orderDetails.totalAmount}</span>
          </div>
        </CardContent>
      </Card>

      {/* Informazioni aggiuntive */}
      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Email di conferma</h4>
              <p className="text-sm text-gray-600">
                Abbiamo inviato una conferma d'ordine a{' '}
                <span className="font-medium">{orderDetails.customerEmail}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Azioni */}
      <div className="flex gap-4">
        <Button variant="outline" asChild className="flex-1">
          <Link href="/account/orders">I miei ordini</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/">Continua shopping</Link>
        </Button>
      </div>
    </div>
  );
}