"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/config";
import Breadcrumb from "@/components/common/Breadcrumb";

interface OrderStatus {
  id: number;
  status: string;
  is_paid: boolean;
  created_at: string;
  paid_at: string | null;
  tracking_number: string | null;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    label: "Pending Payment",
    description: "Waiting for payment confirmation"
  },
  processing: {
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-100",
    label: "Processing",
    description: "Your order is being prepared"
  },
  shipped: {
    icon: Truck,
    color: "text-purple-600",
    bg: "bg-purple-100",
    label: "Shipped",
    description: "Your order is on its way"
  },
  delivered: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
    label: "Delivered",
    description: "Order successfully delivered"
  },
  cancelled: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-100",
    label: "Cancelled",
    description: "Order was cancelled"
  },
};

export default function OrderStatusPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.ORDERS.STATUS}${orderId}/`);
        if (response.ok) {
          const data = await response.json();
          setOrderStatus(data);
        } else {
          setError("Order not found");
        }
      } catch (err) {
        setError("Failed to load order status");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderStatus();
    }
  }, [orderId]);

  if (loading) {
    return (
      <main className="w-full bg-background min-h-screen">
        <div className="container max-w-4xl mx-auto px-6 py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !orderStatus) {
    return (
      <main className="w-full bg-background min-h-screen">
        <div className="container max-w-4xl mx-auto px-6 py-20 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-light text-foreground mb-2">Order Not Found</h1>
          <p className="text-muted-foreground">{error || "The order you're looking for doesn't exist."}</p>
        </div>
      </main>
    );
  }

  const statusInfo = statusConfig[orderStatus.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <main className="w-full bg-background min-h-screen">
      <div className="container max-w-4xl mx-auto px-6 py-20">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb items={[
            { name: "Home", url: "/" },
            { name: "Order Status", url: `/order-status/${orderId}` }
          ]} />
        </div>

        {/* Header */}
        <header className="mb-12 text-center">
          <div className="divider mx-auto max-w-16 mb-8" />
          <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-4">
            Order Status
          </h1>
          <p className="text-lg font-light text-muted-foreground">
            Order #{orderStatus.id}
          </p>
        </header>

        {/* Status Card */}
        <div className="bg-background border border-border/20 rounded-lg p-8 mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className={`w-16 h-16 ${statusInfo.bg} rounded-full flex items-center justify-center`}>
              <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-light text-foreground mb-2">
              {statusInfo.label}
            </h2>
            <p className="text-muted-foreground mb-6">
              {statusInfo.description}
            </p>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-border/20">
            <div>
              <h3 className="font-medium text-foreground mb-2">Order Information</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span>#{orderStatus.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={statusInfo.color}>{statusInfo.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className={orderStatus.is_paid ? "text-green-600" : "text-yellow-600"}>
                    {orderStatus.is_paid ? "Paid" : "Pending"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">Timeline</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Order Placed:</span>
                  <span>{new Date(orderStatus.created_at).toLocaleDateString()}</span>
                </div>
                {orderStatus.paid_at && (
                  <div className="flex justify-between">
                    <span>Payment Confirmed:</span>
                    <span>{new Date(orderStatus.paid_at).toLocaleDateString()}</span>
                  </div>
                )}
                {orderStatus.tracking_number && (
                  <div className="flex justify-between">
                    <span>Tracking Number:</span>
                    <span className="font-medium">{orderStatus.tracking_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-background border border-border/20 rounded-lg p-8">
          <h3 className="font-medium text-foreground mb-6">Order Progress</h3>

          <div className="flex flex-col md:flex-row justify-between relative">
            {Object.entries(statusConfig).slice(0, 4).map(([status, config], index) => {
              const isActive = orderStatus.status === status;
              const isPassed = ['processing', 'shipped', 'delivered'].includes(orderStatus.status) &&
                              ['pending', 'processing'].includes(status);
              const isCompleted = (orderStatus.status === 'shipped' && status === 'pending') ||
                                (orderStatus.status === 'shipped' && status === 'processing') ||
                                (orderStatus.status === 'delivered' && status !== 'delivered');

              return (
                <div key={status} className="flex flex-col items-center relative z-10">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 ${
                    isActive || isCompleted
                      ? `${config.bg} ${config.color} border-current`
                      : 'bg-muted border-border text-muted-foreground'
                  }`}>
                    <config.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-sm font-medium ${
                    isActive ? config.color : 'text-muted-foreground'
                  }`}>
                    {config.label}
                  </span>
                </div>
              );
            })}

            {/* Progress Line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-border -z-0 hidden md:block">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{
                  width: orderStatus.status === 'processing' ? '33%' :
                         orderStatus.status === 'shipped' ? '66%' :
                         orderStatus.status === 'delivered' ? '100%' : '0%'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}