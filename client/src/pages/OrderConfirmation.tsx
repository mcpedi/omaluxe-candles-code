import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

export default function OrderConfirmation() {
  const params = useParams<{ id: string }>();
  const orderId = parseInt(params.id ?? "0");

  const { data, isLoading } = trpc.orders.detail.useQuery(
    { id: orderId },
    { enabled: !!orderId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[oklch(0.72_0.12_75)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const order = data?.order;
  const items = data?.items ?? [];

  return (
    <div className="min-h-screen pt-20">
      <div className="container py-16 max-w-2xl mx-auto">
        {/* Success header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-[oklch(0.72_0.12_75/0.1)] flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} strokeWidth={1} className="text-[oklch(0.62_0.12_70)]" />
          </div>
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[oklch(0.62_0.12_70)] mb-3">Thank You</p>
          <h1 className="font-serif text-4xl font-light text-[oklch(0.18_0.015_60)] mb-3">
            Order Confirmed
          </h1>
          <p className="font-sans text-sm text-[oklch(0.52_0.02_60)]">
            Order #{orderId} has been placed successfully.
          </p>
        </div>

        {order && (
          <div className="bg-[oklch(0.96_0.012_80)] border border-[oklch(0.88_0.015_75)] p-8 mb-8">
            {/* Customer info */}
            <div className="mb-6 pb-6 border-b border-[oklch(0.88_0.015_75)]">
              <h2 className="font-serif text-lg font-medium text-[oklch(0.18_0.015_60)] mb-4">Delivery Details</h2>
              <div className="grid grid-cols-2 gap-4 font-sans text-sm">
                <div>
                  <p className="text-[oklch(0.52_0.02_60)] text-xs mb-1">Name</p>
                  <p className="text-[oklch(0.18_0.015_60)]">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-[oklch(0.52_0.02_60)] text-xs mb-1">Email</p>
                  <p className="text-[oklch(0.18_0.015_60)]">{order.customerEmail}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[oklch(0.52_0.02_60)] text-xs mb-1">Shipping Address</p>
                  <p className="text-[oklch(0.18_0.015_60)]">
                    {order.shippingAddress}{order.city ? `, ${order.city}` : ""}{order.country ? `, ${order.country}` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mb-6 pb-6 border-b border-[oklch(0.88_0.015_75)]">
              <h2 className="font-serif text-lg font-medium text-[oklch(0.18_0.015_60)] mb-4">Items Ordered</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between font-sans text-sm">
                    <div>
                      <span className="text-[oklch(0.18_0.015_60)]">{item.productName}</span>
                      {item.selectedSize && (
                        <span className="text-[oklch(0.52_0.02_60)] ml-2 text-xs">({item.selectedSize})</span>
                      )}
                      <span className="text-[oklch(0.52_0.02_60)] ml-2">×{item.quantity}</span>
                    </div>
                    <span className="text-[oklch(0.38_0.07_55)] font-medium">KSh {parseFloat(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 font-sans text-sm">
              <div className="flex justify-between text-[oklch(0.38_0.04_60)]">
                <span>Subtotal</span><span>KSh {parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[oklch(0.38_0.04_60)]">
                <span>Shipping</span><span>{parseFloat(order.shipping) === 0 ? "Free" : `KSh ${parseFloat(order.shipping).toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-base text-[oklch(0.18_0.015_60)] pt-2 border-t border-[oklch(0.88_0.015_75)]">
                <span>Total</span><span>KSh {parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-3 bg-[oklch(0.72_0.12_75/0.08)] border border-[oklch(0.72_0.12_75/0.2)] p-4 mb-8">
          <Package size={18} strokeWidth={1.5} className="text-[oklch(0.62_0.12_70)] shrink-0" />
          <p className="font-sans text-sm text-[oklch(0.38_0.04_60)]">
            A confirmation has been sent to your email. We'll notify you when your order ships.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/account">
            <button className="btn-luxury-outline">View My Orders</button>
          </Link>
          <Link href="/shop">
            <button className="btn-luxury flex items-center gap-2">
              Continue Shopping <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
