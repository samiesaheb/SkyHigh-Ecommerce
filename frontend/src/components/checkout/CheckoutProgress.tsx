"use client";

import { Check, CreditCard, Package, Truck, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutProgressProps {
  currentStep: 'shipping' | 'payment' | 'confirmation' | 'complete';
}

export default function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  const steps = [
    {
      id: 'shipping',
      title: 'Shipping',
      description: 'Enter your details',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'payment',
      title: 'Payment',
      description: 'Secure checkout',
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      id: 'confirmation',
      title: 'Confirmation',
      description: 'Review your order',
      icon: <Star className="w-4 h-4" />,
    },
    {
      id: 'complete',
      title: 'Complete',
      description: 'Order confirmed',
      icon: <Truck className="w-4 h-4" />,
    },
  ];

  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-border/30">
          <div 
            className="h-full bg-gradient-to-r from-primary via-accent-gold to-accent-sage transition-all duration-700 ease-out"
            style={{ 
              width: `${(currentIndex / (steps.length - 1)) * 100}%`
            }}
          />
        </div>

        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = index < currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div 
              key={step.id} 
              className="flex flex-col items-center relative z-10"
            >
              {/* Step Circle */}
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  isCompleted && "bg-success border-success text-success-foreground shadow-lg shadow-success/20",
                  isActive && "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110",
                  isUpcoming && "bg-background border-border/40 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <div className={cn(
                    "transition-all duration-300",
                    isActive && "scale-110"
                  )}>
                    {step.icon}
                  </div>
                )}
              </div>

              {/* Step Info */}
              <div className="mt-4 text-center max-w-[100px]">
                <h3 className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  isCompleted && "text-success",
                  isActive && "text-primary font-semibold",
                  isUpcoming && "text-muted-foreground"
                )}>
                  {step.title}
                </h3>
                <p className={cn(
                  "text-xs mt-1 transition-colors duration-300",
                  isCompleted && "text-success/70",
                  isActive && "text-primary/70",
                  isUpcoming && "text-muted-foreground/70"
                )}>
                  {step.description}
                </p>
              </div>

              {/* Active Step Pulse Animation */}
              {isActive && (
                <div className="absolute top-0 w-12 h-12 rounded-full border-2 border-primary/30 animate-ping" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}