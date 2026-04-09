import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { Link } from "wouter";
import { Package, ChevronDown, ChevronUp } from "lucide-react";

export default function Account() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const { data: orders, isLoading } = trpc.orders.myOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[oklch(0.72_0.12_75)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl text-[oklch(0.52_0.02_60)] mb-4">Please sign in</p>
          <a href={getLoginUrl()} className="btn-luxury">Sign In</a>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[oklch(0.96_0.012_80)] border border-[oklch(0.88_0.015_75)] p-6">
              <div className="w-14 h-14 rounded-full bg-[oklch(0.72_0.12_75/0.15)] flex items-center justify-center mb-4">
                <span className="font-serif text-xl text-[oklch(0.62_0.12_70)]">
                  {user?.name?.charAt(0).toUpperCase() ?? "U"}
                </span>
              </div>
              <p className="font-serif text-lg font-medium text-[oklch(0.18_0.015_60)]">{user?.name}</p>
              <p className="font-sans text-xs text-[oklch(0.52_0.02_60)] mb-6">{user?.email}</p>
              <div className="space-y-2">
                <div className="font-sans text-xs tracking-[0.12em] uppercase text-[oklch(0.38_0.07_55)] py-2 border-b border-[oklch(0.88_0.015_75)]">
                  My Orders
                </div>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <div className="font-sans text-xs tracking-[0.12em] uppercase text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.38_0.07_55)] py-2 cursor-pointer transition-colors">
                      Admin Panel
                    </div>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="w-full text-left font-sans text-xs tracking-[0.12em] uppercase text-[oklch(0.52_0.02_60)] hover:text-red-500 py-2 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-3">
            <h1 className="font-serif text-3xl font-light text-[oklch(0.18_0.015_60)] mb-8">My Orders</h1>

            {isLoading ? (
              <div className="text-center py-10">
                <div className="w-6 h-6 border-2 border-[oklch(0.72_0.12_75)] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-[oklch(0.88_0.015_75)] overflow-hidden">
                    <div
                      className="flex items-center justify-between p-5 cursor-pointer hover:bg-[oklch(0.98_0.005_80)] transition-colors"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <div className="flex items-center gap-4">
                        <Package size={18} strokeWidth={1.5} className="text-[oklch(0.62_0.12_70)]" />
                        <div>
                          <p className="font-sans text-sm font-medium text-[oklch(0.18_0.015_60)]">Order #{order.id}</p>
                          <p className="font-sans text-xs text-[oklch(0.52_0.02_60)]">
                            {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-sans text-[10px] px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                        <span className="font-sans text-sm font-medium text-[oklch(0.38_0.07_55)]">
                          ${parseFloat(order.total).toFixed(2)}
                        </span>
                        {expandedOrder === order.id ? (
                          <ChevronUp size={16} className="text-[oklch(0.52_0.02_60)]" />
                        ) : (
                          <ChevronDown size={16} className="text-[oklch(0.52_0.02_60)]" />
                        )}
                      </div>
                    </div>

                    {expandedOrder === order.id && (
                      <OrderDetailExpanded orderId={order.id} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-[oklch(0.88_0.015_75)] bg-[oklch(0.96_0.012_80)]">
                <Package size={48} strokeWidth={0.8} className="mx-auto mb-4 text-[oklch(0.72_0.12_75/0.4)]" />
                <p className="font-serif text-2xl font-light text-[oklch(0.52_0.02_60)] mb-2">No orders yet</p>
                <p className="font-sans text-sm text-[oklch(0.62_0.02_60)] mb-6">Start your OmaLuxe journey today</p>
                <Link href="/shop">
                  <button className="btn-luxury">Explore Collection</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderDetailExpanded({ orderId }: { orderId: number }) {
  const { data } = trpc.orders.detail.useQuery({ id: orderId });
  if (!data) return <div className="px-5 pb-5 text-center"><div className="w-5 h-5 border-2 border-[oklch(0.72_0.12_75)] border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  return (
    <div className="px-5 pb-5 border-t border-[oklch(0.88_0.015_75)]">
      <div className="pt-4 space-y-2">
        {data.items.map((item) => (
          <div key={item.id} className="flex justify-between font-sans text-sm">
            <span className="text-[oklch(0.38_0.04_60)]">
              {item.productName}
              {item.selectedSize ? ` (${item.selectedSize})` : ""} ×{item.quantity}
            </span>
            <span className="text-[oklch(0.38_0.07_55)]">${parseFloat(item.subtotal).toFixed(2)}</span>
          </div>
        ))}
        <div className="pt-2 border-t border-[oklch(0.88_0.015_75)] flex justify-between font-sans text-sm font-medium">
          <span>Total</span>
          <span className="text-[oklch(0.38_0.07_55)]">${parseFloat(data.order.total).toFixed(2)}</span>
        </div>
        <p className="font-sans text-xs text-[oklch(0.52_0.02_60)] pt-1">
          Ships to: {data.order.shippingAddress}{data.order.city ? `, ${data.order.city}` : ""}
        </p>
      </div>
    </div>
  );
}
