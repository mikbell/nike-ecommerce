"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Shield, Lock } from "lucide-react";

export default function PaymentSection() {
  return (
    <div className="space-y-4">
      {/* Payment Method */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium">Carta di credito/debito</p>
            <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
          </div>
        </div>
        <Badge variant="secondary">Sicuro</Badge>
      </div>

      {/* Security Info */}
      <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg space-y-3">
        <div className="flex items-center gap-2 font-medium">
          <Shield className="h-4 w-4" />
          <span>Pagamento sicuro</span>
        </div>
        <p>
          Il pagamento verrà processato in modo sicuro tramite Stripe. 
          I tuoi dati della carta non vengono salvati sui nostri server.
        </p>
        
        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span className="text-xs">SSL Encryption</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span className="text-xs">PCI Compliant</span>
          </div>
        </div>
      </div>

      {/* Accepted Cards */}
      <div>
        <p className="text-sm font-medium mb-2">Carte accettate:</p>
        <div className="flex gap-2">
          <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">VISA</div>
          <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">MASTERCARD</div>
          <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">AMEX</div>
          <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">DISCOVER</div>
        </div>
      </div>
    </div>
  );
}