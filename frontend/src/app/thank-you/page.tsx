"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/HeaderContext"; // ✅ import

type OrderItem = {
  id: number;
  name: string;
  price: string;
  quantity: number;
  main_image: string;
};

type LatestOrder = {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  items: OrderItem[];
};

export default function ThankYouPage() {
  const [order, setOrder] = useState<LatestOrder | null>(null);
  const { refreshQuantity } = useCart(); // ✅ grab refresh

  useEffect(() => {
    fetch("http://localhost:8000/api/orders/latest/", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setOrder(data);
          refreshQuantity(); // ✅ refresh cart after successful order fetch
        }
      });
  }, [refreshQuantity]);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-gray-500">Loading your order...</p>
      </div>
    );
  }

  const getImageUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    if (path.startsWith("/media/")) return `http://localhost:8000${path}`;
    return `http://localhost:8000/media/${path}`;
  };

  const total = order.items.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        🎉 Thank You, {order.name}!
      </h1>
      <p className="text-white-700 text-lg mb-6">
        Your order has been placed successfully. A confirmation has been sent to{" "}
        <span className="font-medium text-white">{order.email}</span>.
      </p>

      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2 text-black">Shipping To:</h2>
        <p className="text-gray-800">{order.address}</p>
        <p className="text-gray-800">
          {order.city}, {order.zip}
        </p>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-black">Order Summary:</h2>
        <ul className="space-y-4">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between border-b pb-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={getImageUrl(item.main_image)}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded border"
                />
                <div>
                  <p className="font-semibold text-black">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="text-red-600 font-semibold">
                ฿{(parseFloat(item.price) * item.quantity).toFixed(2)}
              </p>
            </li>
          ))}
        </ul>

        <p className="text-right mt-4 font-semibold text-lg">
          Total: ฿{total.toFixed(2)}
        </p>

        <div className="text-center mt-6">
          <a
            href="/products"
            className="inline-block bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    </div>
  );
}
