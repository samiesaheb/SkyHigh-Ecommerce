"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/components/HeaderContext";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const router = useRouter();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (cartItems.length === 0) {
    return <div className="text-center py-12 text-gray-600">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

      <div className="space-y-4">
        {cartItems.map((item) => (
          <Card key={item.id} className="flex gap-4 p-4">
            <img
              src={
                item.main_image?.startsWith("http")
                  ? item.main_image
                  : `http://localhost:8000${item.main_image}`
              }
              alt={item.name}
              className="w-28 h-28 object-cover rounded border"
            />
            <CardContent className="flex-1">
              <div className="text-lg font-semibold text-gray-900 mb-1">{item.name}</div>
              <div className="text-sm text-gray-500 mb-2">
                ฿{item.price.toFixed(2)}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    item.quantity > 1
                      ? updateQuantity(item.id, item.quantity - 1)
                      : removeFromCart(item.id)
                  }
                >
                  –
                </Button>
                <span className="px-2">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 ml-4"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-4">
        <CardContent className="flex justify-between items-center">
          <div className="text-lg font-semibold">Total:</div>
          <div className="text-red-600 font-bold text-xl">฿{totalPrice.toFixed(2)}</div>
        </CardContent>
        <CardFooter className="mt-4">
          <Button className="w-full" onClick={handleCheckout}>
            Proceed to Checkout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
