'use client'

import { useEffect, useState } from 'react'

type OrderItem = {
  product: string
  quantity: number
  price: string
  image?: string
}

type Order = {
  id: number
  created_at: string
  total_price: string
  status: string
  items: OrderItem[]
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://localhost:8000/api/orders/', { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch orders. Status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        setOrders(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('❌ Error fetching order history:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-red-600 mb-8">🛒 Order History</h1>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">❌ {error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="text-gray-600">You haven’t placed any orders yet.</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-8">
          {orders.map(order => (
            <div key={order.id} className="border rounded-md p-4 shadow-sm">
              <div className="mb-4">
                <p className="text-lg font-semibold text-black">Order #{order.id}</p>
                <p className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleString()}
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-black">Status:</span>{' '}
                  <span className="text-blue-600">{order.status}</span>
                </p>
              </div>

              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 border p-2 rounded-md"
                  >
                    <img
                      src={item.image || '/placeholder.png'} // ✅ fallback if image missing
                      alt={item.product}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-black">{item.product}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Price: ฿{item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-right mt-4">
                <p className="text-lg font-semibold">
                  Total: <span className="text-red-600">฿{order.total_price}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
