"use client";

import { useState } from "react";
import { MapPin, Package, Truck } from "lucide-react";

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: React.ReactNode;
}

interface ShippingCalculatorProps {
  subtotal: number;
  onShippingChange: (method: ShippingMethod | null) => void;
  selectedShipping?: ShippingMethod | null;
}

export default function ShippingCalculator({ 
  subtotal, 
  onShippingChange, 
  selectedShipping 
}: ShippingCalculatorProps) {
  const [postalCode, setPostalCode] = useState("");
  const [showMethods, setShowMethods] = useState(false);

  const shippingMethods: ShippingMethod[] = [
    {
      id: "standard",
      name: "Standard Delivery",
      description: "Regular delivery across Thailand",
      price: subtotal >= 1000 ? 0 : 50,
      estimatedDays: "3-5 business days",
      icon: <Package className="w-4 h-4" />
    },
    {
      id: "express",
      name: "Express Delivery",
      description: "Faster delivery for Bangkok area",
      price: 100,
      estimatedDays: "1-2 business days",
      icon: <Truck className="w-4 h-4" />
    },
    {
      id: "same-day",
      name: "Same Day Delivery",
      description: "Same day delivery in Bangkok (order before 2 PM)",
      price: 200,
      estimatedDays: "Same day",
      icon: <MapPin className="w-4 h-4" />
    }
  ];

  const handleCalculateShipping = () => {
    if (postalCode.length >= 5) {
      setShowMethods(true);
      // Auto-select standard shipping if none selected
      if (!selectedShipping) {
        const standard = shippingMethods[0];
        onShippingChange(standard);
      }
    }
  };

  const handleMethodSelect = (method: ShippingMethod) => {
    onShippingChange(method);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <h4 className="text-sm font-medium text-foreground">Calculate Shipping</h4>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Postal Code (e.g., 10110)"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            maxLength={5}
            className="flex-1 px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            onClick={handleCalculateShipping}
            disabled={postalCode.length < 5}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Calculate
          </button>
        </div>

        {showMethods && (
          <div className="space-y-2 animate-in fade-in-0 slide-in-from-top-2 duration-300">
            {shippingMethods.map((method) => {
              const isSelected = selectedShipping?.id === method.id;
              return (
                <div
                  key={method.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-border/60 hover:bg-muted/20'
                  }`}
                  onClick={() => handleMethodSelect(method)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${
                        isSelected ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground'
                      }`}>
                        {method.icon}
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-foreground">
                          {method.name}
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          {method.description}
                        </p>
                        <p className="text-xs text-accent-sage">
                          {method.estimatedDays}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {method.price === 0 ? 'Free' : `฿${method.price}`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {subtotal < 1000 && (
              <div className="text-xs text-muted-foreground bg-accent-gold/10 border border-accent-gold/20 p-3 rounded-lg">
                <span className="text-accent-gold font-medium">💡 Tip:</span> Add ฿{(1000 - subtotal).toFixed(2)} more for free standard shipping!
              </div>
            )}
          </div>
        )}

        {!showMethods && (
          <p className="text-xs text-muted-foreground">
            Enter your postal code to see available shipping options
          </p>
        )}
      </div>
    </div>
  );
}