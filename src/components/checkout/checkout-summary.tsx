"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { Package, Truck, Gift } from "lucide-react";

export default function CheckoutSummary() {
  const { items, subtotal, shipping, tax, total } = useCartStore();

  const qualifiesForFreeShipping = subtotal >= 50;
  const amountForFreeShipping = 50 - subtotal;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Riepilogo ordine
        </CardTitle>
        <CardDescription>
          Controlla i tuoi articoli prima di completare l'ordine
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2">
              <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <span>Taglia: {item.size}</span>
                  <span>•</span>
                  <span>Colore: {item.color}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-xs text-gray-500 line-through">
                        {formatPrice(item.originalPrice * item.quantity)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Free Shipping Banner */}
        {!qualifiesForFreeShipping && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Spedizione gratuita
              </span>
            </div>
            <p className="text-xs text-blue-700">
              Aggiungi {formatPrice(amountForFreeShipping)} per la spedizione gratuita
            </p>
          </div>
        )}

        {qualifiesForFreeShipping && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Spedizione gratuita inclusa!
              </span>
            </div>
          </div>
        )}

        {/* Order Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotale:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Spedizione:</span>
            <span className={qualifiesForFreeShipping ? "text-green-600" : ""}>
              {qualifiesForFreeShipping ? "Gratuita" : formatPrice(shipping)}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>IVA (22%):</span>
            <span>{formatPrice(tax)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-bold text-lg">
            <span>Totale:</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {/* Estimated Delivery */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">Consegna stimata</span>
          </div>
          <p className="text-xs text-gray-600">
            3-5 giorni lavorativi per l'Italia
          </p>
        </div>

        {/* Order Protection */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs py-0">
              Garanzia
            </Badge>
            <span>Reso gratuito entro 30 giorni</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs py-0">
              Sicurezza
            </Badge>
            <span>Pagamenti protetti da Stripe</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}