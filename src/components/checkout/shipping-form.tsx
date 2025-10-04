"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckoutForm } from "@/types";
import { cn } from "@/lib/utils";

interface ShippingFormProps {
  formData: CheckoutForm;
  errors: Record<string, string>;
  onChange: (field: keyof CheckoutForm, value: string | boolean) => void;
}

const countries = [
  { value: "IT", label: "Italia" },
  { value: "FR", label: "Francia" },
  { value: "DE", label: "Germania" },
  { value: "ES", label: "Spagna" },
  { value: "US", label: "Stati Uniti" },
  { value: "UK", label: "Regno Unito" },
];

export default function ShippingForm({ formData, errors, onChange }: ShippingFormProps) {
  return (
    <div className="space-y-4">
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Nome *</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            className={cn(errors.firstName && "border-red-500 focus:border-red-500")}
            placeholder="Mario"
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName">Cognome *</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            className={cn(errors.lastName && "border-red-500 focus:border-red-500")}
            placeholder="Rossi"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
          className={cn(errors.email && "border-red-500 focus:border-red-500")}
          placeholder="mario.rossi@esempio.it"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <Label htmlFor="phone">Telefono</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          className={cn(errors.phone && "border-red-500 focus:border-red-500")}
          placeholder="+39 123 456 7890"
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <Label htmlFor="address">Indirizzo *</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={(e) => onChange("address", e.target.value)}
          className={cn(errors.address && "border-red-500 focus:border-red-500")}
          placeholder="Via Roma 123"
        />
        {errors.address && (
          <p className="text-red-500 text-sm mt-1">{errors.address}</p>
        )}
      </div>

      {/* City, State, Postal Code */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">Città *</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={(e) => onChange("city", e.target.value)}
            className={cn(errors.city && "border-red-500 focus:border-red-500")}
            placeholder="Milano"
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
          )}
        </div>
        <div>
          <Label htmlFor="state">Provincia</Label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={(e) => onChange("state", e.target.value)}
            placeholder="MI"
          />
        </div>
        <div>
          <Label htmlFor="postalCode">CAP *</Label>
          <Input
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={(e) => onChange("postalCode", e.target.value)}
            className={cn(errors.postalCode && "border-red-500 focus:border-red-500")}
            placeholder="20100"
            maxLength={5}
          />
          {errors.postalCode && (
            <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
          )}
        </div>
      </div>

      {/* Country */}
      <div>
        <Label htmlFor="country">Paese *</Label>
        <Select
          value={formData.country}
          onValueChange={(value) => onChange("country", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona paese" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.value} value={country.value}>
                {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Checkboxes */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="saveInfo"
            checked={formData.saveInfo}
            onCheckedChange={(checked) => onChange("saveInfo", !!checked)}
          />
          <Label
            htmlFor="saveInfo"
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Salva queste informazioni per ordini futuri
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="newsletter"
            checked={formData.newsletter}
            onCheckedChange={(checked) => onChange("newsletter", !!checked)}
          />
          <Label
            htmlFor="newsletter"
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Iscriviti alla newsletter per offerte esclusive
          </Label>
        </div>
      </div>
    </div>
  );
}