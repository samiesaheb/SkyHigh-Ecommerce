"use client";

import { cn } from "@/lib/utils";

export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 p-3 animate-pulse">
      {/* Image skeleton */}
      <div className="w-16 h-16 bg-muted/50 rounded flex-shrink-0" 
           style={{ borderRadius: "var(--radius)" }} />
      
      {/* Content skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="space-y-1">
          <div className="h-4 bg-muted/50 rounded w-3/4" />
          <div className="h-3 bg-muted/30 rounded w-1/2" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-muted/50 rounded" />
            <div className="w-8 h-4 bg-muted/50 rounded" />
            <div className="w-7 h-7 bg-muted/50 rounded" />
          </div>
          <div className="h-4 bg-muted/50 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function CartPageSkeleton() {
  return (
    <div className="container section-container">
      {/* Header skeleton */}
      <div className="mb-12 space-y-4">
        <div className="h-4 bg-muted/50 rounded w-32" />
        <div className="h-8 bg-muted/50 rounded w-48" />
        <div className="h-4 bg-muted/50 rounded w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart items skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex gap-6">
                <div className="w-24 h-24 bg-muted/50 rounded flex-shrink-0" />
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="h-5 bg-muted/50 rounded w-3/4" />
                    <div className="h-4 bg-muted/30 rounded w-1/2" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted/50 rounded" />
                      <div className="w-12 h-4 bg-muted/50 rounded" />
                      <div className="w-8 h-8 bg-muted/50 rounded" />
                    </div>
                    <div className="h-6 bg-muted/50 rounded w-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary skeleton */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="card p-6 space-y-6 animate-pulse">
              <div className="h-6 bg-muted/50 rounded w-32" />
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="h-4 bg-muted/30 rounded w-16" />
                  <div className="h-4 bg-muted/50 rounded w-20" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-muted/30 rounded w-16" />
                  <div className="h-4 bg-muted/50 rounded w-16" />
                </div>
                <div className="divider" />
                <div className="flex justify-between">
                  <div className="h-5 bg-muted/50 rounded w-12" />
                  <div className="h-6 bg-muted/50 rounded w-24" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-12 bg-muted/50 rounded w-full" />
                <div className="h-12 bg-muted/30 rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}