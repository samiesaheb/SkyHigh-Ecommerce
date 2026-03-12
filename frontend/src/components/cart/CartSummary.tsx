"use client";

import Link from "next/link";
import type { CartItem } from "@/types";

interface CartSummaryProps {
  cartItems: CartItem[];
}

export default function CartSummary({ cartItems }: CartSummaryProps) {
  const total = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0), 
    0
  );

  return (
    <>
      <div className="pt-3 border-t border-gray-200 flex justify-between text-sm font-semibold mt-3">
        <span>Total:</span>
        <span>฿{total.toFixed(2)}</span>
      </div>

      <Link
        href="/cart"
        className="block mt-4 w-full text-center bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
      >
        View Cart
      </Link>
    </>
  );
}