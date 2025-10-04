"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/stores/cart-store";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Truck, Shield, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { CheckoutForm } from "@/types";
import { isValidEmail, isValidPhone } from "@/lib/utils";
import { withErrorHandling, createResponse } from "@/lib/api";

// === Components ===
import CheckoutSummary from "@/components/checkout/checkout-summary";
import ShippingForm from "@/components/checkout/shipping-form";
import PaymentSection from "@/components/checkout/payment-section";

// === Types ===
interface CheckoutState {
  isSubmitting: boolean;
  errors: Record<string, string>;
  formData: CheckoutForm;
}

// === Main Component ===
export default function CheckoutPageOptimized() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { items, total, clearCart, hasItems } = useCartStore();
  
  const [state, setState] = useState<CheckoutState>({
    isSubmitting: false,
    errors: {},
    formData: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "IT",
      saveInfo: false,
      newsletter: false,
    },
  });

  // Pre-fill form with user data when available
  useEffect(() => {
    if (user && user.email && state.formData.email === "") {
      setState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          email: user.email,
          firstName: user.name?.split(' ')[0] || "",
          lastName: user.name?.split(' ').slice(1).join(' ') || "",
        },
      }));
    }
  }, [user, state.formData.email]);

  // === Effects ===
  useEffect(() => {
    if (!hasItems) {
      router.push("/");
      toast.error("Il carrello è vuoto");
    }
  }, [hasItems, router]);

  useEffect(() => {
    // Check auth only after auth loading is complete
    if (!isAuthLoading && !user) {
      router.push("/sign-in?redirect=/checkout");
      toast.info("Effettua l'accesso per completare l'ordine");
    }
  }, [isAuthLoading, user, router]);

  // === Form Validation ===
  const validateForm = (data: CheckoutForm): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.firstName.trim()) {
      errors.firstName = "Nome obbligatorio";
    }
    
    if (!data.lastName.trim()) {
      errors.lastName = "Cognome obbligatorio";
    }
    
    if (!data.email.trim()) {
      errors.email = "Email obbligatoria";
    } else if (!isValidEmail(data.email)) {
      errors.email = "Email non valida";
    }
    
    if (data.phone && !isValidPhone(data.phone)) {
      errors.phone = "Numero di telefono non valido";
    }
    
    if (!data.address.trim()) {
      errors.address = "Indirizzo obbligatorio";
    }
    
    if (!data.city.trim()) {
      errors.city = "Città obbligatoria";
    }
    
    if (!data.postalCode.trim()) {
      errors.postalCode = "CAP obbligatorio";
    } else if (!/^\d{5}$/.test(data.postalCode)) {
      errors.postalCode = "CAP deve essere di 5 cifre";
    }

    return errors;
  };

  // === Event Handlers ===
  const handleInputChange = (field: keyof CheckoutForm, value: string | boolean) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      errors: { ...prev.errors, [field]: "" }, // Clear error when user types
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm(state.formData);
    if (Object.keys(errors).length > 0) {
      setState(prev => ({ ...prev, errors }));
      toast.error("Per favore correggi gli errori nel form");
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingInfo: state.formData,
          items: items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: total,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Errore durante la creazione dell\'ordine');
      }

      const orderResult = await orderResponse.json();

      // Create Stripe checkout session
      const stripeResponse = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items,
          customerInfo: state.formData,
          orderId: orderResult.order.id,
        }),
      });

      if (!stripeResponse.ok) {
        const errorData = await stripeResponse.json();
        throw new Error(errorData.error || 'Errore durante la creazione del pagamento');
      }

      const stripeResult = await stripeResponse.json();

      // Redirect to Stripe Checkout
      if (stripeResult.url) {
        window.location.href = stripeResult.url;
      } else {
        throw new Error('URL di pagamento non disponibile');
      }

    } catch (error) {
      console.error("Errore durante il checkout:", error);
      toast.error(error instanceof Error ? error.message : "Errore durante il checkout. Riprova.");
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // === Render Guards ===
  if (!hasItems) {
    return null;
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifica autenticazione...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to sign-in
  }

  // === Render ===
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Torna allo shopping
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
              <p className="text-gray-600">Completa il tuo ordine in modo sicuro</p>
            </div>
            {user && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border">
                <User className="h-4 w-4 text-gray-500" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Informazioni di spedizione
                  </CardTitle>
                  <CardDescription>
                    Inserisci le informazioni per la consegna
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ShippingForm
                    formData={state.formData}
                    errors={state.errors}
                    onChange={handleInputChange}
                  />
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Metodo di pagamento
                  </CardTitle>
                  <CardDescription>
                    Pagamento sicuro con Stripe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentSection />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="sticky top-4">
                <CheckoutSummary />
                
                {/* Complete Order Button */}
                <Button 
                  type="submit"
                  disabled={state.isSubmitting}
                  className="w-full mt-6"
                  size="lg"
                >
                  {state.isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    `Completa ordine - €${total.toFixed(2)}`
                  )}
                </Button>

                {/* Terms */}
                <div className="text-center text-sm text-gray-500 mt-4">
                  <p>Cliccando "Completa ordine" accetti i nostri</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      Termini di servizio
                    </Link>
                    <span>e</span>
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}