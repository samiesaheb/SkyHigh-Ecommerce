"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { buildImageUrl } from "@/lib/config";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  loading?: "lazy" | "eager";
  onLoad?: () => void;
  onError?: () => void;
}

// Generate a simple blur data URL
const generateBlurDataURL = (w: number = 10, h: number = 10) => {
  return `data:image/svg+xml;base64,${btoa(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
    </svg>`
  )}`;
};

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  priority = false,
  sizes,
  quality = 85,
  placeholder = "blur",
  blurDataURL,
  objectFit = "cover",
  loading = "lazy",
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use buildImageUrl for proper URL handling
  const imageSrc = buildImageUrl(src);
  
  // Generate blur placeholder if not provided
  const blurPlaceholder = blurDataURL || generateBlurDataURL(width, height);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  if (imageError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        style={{ 
          width: !fill ? width : undefined, 
          height: !fill ? height : undefined 
        }}
      >
        <svg 
          className="w-8 h-8" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" 
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("relative", !fill && "inline-block")}>
      <Image
        src={imageSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        sizes={sizes || (fill ? "100vw" : undefined)}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={placeholder === "blur" ? blurPlaceholder : undefined}
        loading={priority ? "eager" : loading}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          fill ? `object-${objectFit}` : "",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-muted animate-pulse",
            className
          )}
        >
          <div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Specialized components for common use cases
export function ProductImage({ 
  src, 
  alt, 
  priority = false,
  className
}: { 
  src: string; 
  alt: string; 
  priority?: boolean;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      quality={90}
      className={className}
      objectFit="cover"
    />
  );
}

export function HeroImage({ 
  src, 
  alt, 
  className 
}: { 
  src: string; 
  alt: string; 
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      priority={true}
      sizes="100vw"
      quality={95}
      className={className}
      objectFit="cover"
    />
  );
}

export function AvatarImage({ 
  src, 
  alt, 
  size = 40,
  className 
}: { 
  src: string; 
  alt: string; 
  size?: number;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      quality={85}
      className={cn("rounded-full", className)}
      objectFit="cover"
    />
  );
}