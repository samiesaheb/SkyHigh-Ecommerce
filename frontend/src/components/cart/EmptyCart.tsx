"use client";

import { ShoppingBag } from "lucide-react";

export default function EmptyCart() {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingBag className="w-8 h-8 text-gray-300" />
      </div>
      <p className="text-gray-500 italic">Your bag is empty</p>
      <p className="text-sm text-gray-400 mt-1">Discover amazing products to add!</p>
    </div>
  );
}