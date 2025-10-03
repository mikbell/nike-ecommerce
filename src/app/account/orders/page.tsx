'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Calendar, CreditCard, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  currency: string;
  createdAt: string;
  itemCount: number;
  items: Array<{
    productName: string;
    variantName: string;
    quantity: number;
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/sign-in');
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, isAuthLoading, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Errore recupero ordini:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'In attesa', variant: 'secondary' as const },
      paid: { label: 'Pagato', variant: 'default' as const },
      processing: { label: 'In elaborazione', variant: 'default' as const },
      shipped: { label: 'Spedito', variant: 'default' as const },
      delivered: { label: 'Consegnato', variant: 'default' as const },
      cancelled: { label: 'Annullato', variant: 'destructive' as const },
      refunded: { label: 'Rimborsato', variant: 'secondary' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'secondary' as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Caricamento ordini...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">I miei ordini</h1>
        <p className="text-gray-600">
          Visualizza e gestisci i tuoi ordini recenti
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nessun ordine trovato</h3>
            <p className="text-gray-600 mb-6">
              Non hai ancora effettuato ordini. Inizia a fare shopping!
            </p>
            <Button asChild>
              <Link href="/">Inizia a fare shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Ordine #{order.orderNumber}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.createdAt).toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                      <CreditCard className="w-4 h-4" />
                      €{order.totalAmount}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Preview items */}
                  <div className="space-y-2">
                    {order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-800">
                          {item.productName} - {item.variantName}
                        </span>
                        <span className="text-gray-600">
                          Qtà: {item.quantity}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-sm text-gray-600">
                        +{order.items.length - 2} altri prodotti
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {order.itemCount} prodott{order.itemCount > 1 ? 'i' : 'o'}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <Link 
                        href={`/account/orders/${order.id}`}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Visualizza dettagli
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}