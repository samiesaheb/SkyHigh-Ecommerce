"use client";

import { Shield, Lock, CreditCard, Truck, RotateCcw, Award, Users, CheckCircle, Globe, Beaker, Clock, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

function TrustBadge({ icon, title, description, className }: TrustBadgeProps) {
  return (
    <div className={cn("flex items-start gap-3 p-4 rounded-lg bg-muted/20 border border-border/20 transition-all duration-300 hover:bg-muted/30", className)}>
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm text-foreground leading-tight mb-1">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

interface SecurityBadgesProps {
  className?: string;
  variant?: "horizontal" | "vertical" | "grid";
}

export function SecurityBadges({ className, variant = "horizontal" }: SecurityBadgesProps) {
  const badges = [
    {
      icon: <Lock className="w-4 h-4 text-primary" />,
      title: "SSL Secured",
      description: "Your data is encrypted and protected"
    },
    {
      icon: <CreditCard className="w-4 h-4 text-primary" />,
      title: "Secure Payment",
      description: "Powered by Stripe with bank-level security"
    },
    {
      icon: <Shield className="w-4 h-4 text-primary" />,
      title: "Privacy Protected",
      description: "We never sell your personal information"
    }
  ];

  const containerClasses = cn(
    variant === "horizontal" && "flex gap-4 overflow-x-auto",
    variant === "vertical" && "space-y-3",
    variant === "grid" && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
    className
  );

  return (
    <div className={containerClasses}>
      {badges.map((badge, index) => (
        <TrustBadge
          key={index}
          icon={badge.icon}
          title={badge.title}
          description={badge.description}
          className={variant === "horizontal" ? "min-w-[280px]" : ""}
        />
      ))}
    </div>
  );
}

interface ServiceHighlightsProps {
  className?: string;
  variant?: "horizontal" | "vertical" | "grid";
}

export function ServiceHighlights({ className, variant = "grid" }: ServiceHighlightsProps) {
  const highlights = [
    {
      icon: <Truck className="w-4 h-4 text-primary" />,
      title: "Free Shipping",
      description: "On orders over ฿1,000"
    },
    {
      icon: <RotateCcw className="w-4 h-4 text-primary" />,
      title: "30-Day Returns",
      description: "Easy returns and exchanges"
    },
    {
      icon: <Award className="w-4 h-4 text-primary" />,
      title: "Quality Guarantee",
      description: "Premium fashion & lifestyle products"
    },
    {
      icon: <Users className="w-4 h-4 text-primary" />,
      title: "24/7 Support",
      description: "Always here to help you"
    }
  ];

  const containerClasses = cn(
    variant === "horizontal" && "flex gap-4 overflow-x-auto",
    variant === "vertical" && "space-y-3",
    variant === "grid" && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
    className
  );

  return (
    <div className={containerClasses}>
      {highlights.map((highlight, index) => (
        <TrustBadge
          key={index}
          icon={highlight.icon}
          title={highlight.title}
          description={highlight.description}
          className={variant === "horizontal" ? "min-w-[240px]" : ""}
        />
      ))}
    </div>
  );
}

interface TrustIndicatorsProps {
  showReviews?: boolean;
  showCustomerCount?: boolean;
  showSecurityBadge?: boolean;
  className?: string;
}

export function TrustIndicators({
  showReviews = true,
  showCustomerCount = true,
  showSecurityBadge = true,
  className
}: TrustIndicatorsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-6 text-sm text-muted-foreground", className)}>
      {showReviews && (
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-4 h-4 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span>4.8/5 (2,341 reviews)</span>
        </div>
      )}

      {showCustomerCount && (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>10,000+ happy customers</span>
        </div>
      )}

      {showSecurityBadge && (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-600" />
          <span>SSL secured checkout</span>
        </div>
      )}
    </div>
  );
}

export function CheckoutSecurityNotice({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 p-4 bg-muted/20 border border-border/20 rounded-lg", className)}>
      <Lock className="w-5 h-5 text-green-600" />
      <span className="text-sm text-muted-foreground">
        Your payment information is secure and encrypted
      </span>
    </div>
  );
}

// B2B Certifications Component
interface B2BCertificationsProps {
  className?: string;
  variant?: "compact" | "detailed";
}

export function B2BCertifications({ className, variant = "detailed" }: B2BCertificationsProps) {
  const certifications = [
    {
      icon: <Award className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      title: "ISO 9001:2015",
      description: "Quality Management System Certified",
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />,
      title: "GMP Compliant",
      description: "Good Manufacturing Practices",
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
      title: "FDA Registered",
      description: "International Standards Compliance",
    },
    {
      icon: <Globe className="w-8 h-8 text-orange-600 dark:text-orange-400" />,
      title: "Global Export",
      description: "15+ Markets Worldwide",
    }
  ];

  const highlights = [
    {
      icon: <Clock className="w-10 h-10 text-primary" />,
      title: "24+ Years",
      subtitle: "Experience",
      description: "Established since 2000",
    },
    {
      icon: <Users className="w-10 h-10 text-primary" />,
      title: "50+ Clients",
      subtitle: "Active",
      description: "Trusted partnerships globally",
    },
    {
      icon: <Package className="w-10 h-10 text-primary" />,
      title: "1000+",
      subtitle: "Products",
      description: "Successfully developed",
    },
    {
      icon: <Beaker className="w-10 h-10 text-primary" />,
      title: "In-House",
      subtitle: "R&D Lab",
      description: "Custom formulation",
    }
  ];

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap items-center justify-center gap-8 py-6", className)}>
        {certifications.map((cert, index) => (
          <div key={index} className="flex items-center gap-3">
            {cert.icon}
            <div>
              <div className="font-medium text-foreground text-sm">{cert.title}</div>
              <div className="text-xs text-muted-foreground">{cert.description}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-12", className)}>
      {/* Certifications */}
      <div>
        <div className="text-center mb-8">
          <h3 className="text-xl font-medium text-foreground mb-2">
            Certified Excellence
          </h3>
          <p className="text-sm text-muted-foreground">
            Internationally recognized quality standards
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {certifications.map((cert, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg bg-card border border-border/20 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 mb-4 group-hover:scale-110 transition-transform">
                {cert.icon}
              </div>
              <h4 className="font-semibold text-foreground mb-2">{cert.title}</h4>
              <p className="text-sm text-muted-foreground">{cert.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Company Highlights */}
      <div>
        <div className="text-center mb-8">
          <h3 className="text-xl font-medium text-foreground mb-2">
            Why Choose Sky High
          </h3>
          <p className="text-sm text-muted-foreground">
            Proven track record in cosmetic manufacturing
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors group"
            >
              <div className="mb-3 group-hover:scale-110 transition-transform inline-block">
                {highlight.icon}
              </div>
              <div className="text-2xl font-light text-foreground mb-1">
                {highlight.title}
              </div>
              <div className="text-sm font-medium text-primary mb-1">
                {highlight.subtitle}
              </div>
              <p className="text-xs text-muted-foreground">
                {highlight.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TrustBadges() {
  return <SecurityBadges />;
}