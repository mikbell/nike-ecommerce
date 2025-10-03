'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestOrdersPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const createTestOrder = async () => {
    try {
      setIsLoading(true);
      setResult(null);

      const response = await fetch('/api/test/create-order', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Errore durante la creazione dell\'ordine' });
    } finally {
      setIsLoading(false);
    }
  };

  const testWebhook = async () => {
    try {
      setIsLoading(true);
      setResult(null);

      // Simula un evento webhook di test
      const testEvent = {
        id: 'evt_test_webhook',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_session',
            payment_intent: 'pi_test_payment',
            metadata: {
              userId: 'test_user_id',
              customerEmail: 'test@example.com',
              cartItems: JSON.stringify([
                {
                  variantId: 'test_variant',
                  quantity: 1,
                  price: 99.99
                }
              ])
            },
            customer_details: {
              email: 'test@example.com',
              phone: '+39 123 456 7890',
              address: {
                line1: 'Via Roma 123',
                city: 'Milano',
                postal_code: '20100',
                country: 'IT'
              }
            },
            shipping_details: {
              address: {
                line1: 'Via Roma 123',
                city: 'Milano',
                postal_code: '20100',
                country: 'IT'
              }
            }
          }
        }
      };

      const response = await fetch('/api/stripe/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'test_signature'
        },
        body: JSON.stringify(testEvent),
      });

      const data = await response.json();
      setResult({ webhook: data, message: 'Test webhook eseguito' });
    } catch (error) {
      setResult({ error: 'Errore durante il test webhook' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Ordini</CardTitle>
          <CardDescription>
            Utilizza questi pulsanti per testare la creazione degli ordini
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button 
              onClick={createTestOrder}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creando...' : 'Crea Ordine di Test'}
            </Button>
            <p className="text-sm text-gray-600">
              Crea un ordine di test direttamente nel database
            </p>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={testWebhook}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? 'Testando...' : 'Test Webhook Stripe'}
            </Button>
            <p className="text-sm text-gray-600">
              Testa il webhook di Stripe con dati simulati
            </p>
          </div>

          {result && (
            <Card className="mt-4">
              <CardContent className="pt-4">
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}