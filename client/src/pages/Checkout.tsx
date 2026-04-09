import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { toast } from "sonner";

export default function Checkout() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const [form, setForm] = useState({
    customerName: user?.name ?? "",
    customerEmail: user?.email ?? "",
    customerPhone: "",
    shippingAddress: "",
    city: "",
    country: "",
    postalCode: "",
    notes: "",
  });

  const { data: cartItems, isLoading } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const placeOrder = trpc.orders.place.useMutation({
    onSuccess: (data) => {
      navigate(`/order-confirmation/${data.orderId}`);
    },
    onError: (err) => toast.error(err.message || "Failed to place order"),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl text-[oklch(0.52_0.02_60)] mb-4">Please sign in to checkout</p>
          <a href={getLoginUrl()} className="btn-luxury">Sign In</a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[oklch(0.72_0.12_75)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl text-[oklch(0.52_0.02_60)] mb-4">Your cart is empty</p>
          <Link href="/shop"><button className="btn-luxury">Continue Shopping</button></Link>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.customerEmail || !form.shippingAddress) {
      toast.error("Please fill in all required fields");
      return;
    }
    placeOrder.mutate({
      ...form,
      items: cartItems.map((item) => ({
        productId: item.productId,
        productName: item.product?.name ?? "Product",
        selectedSize: item.selectedSize ?? undefined,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: (parseFloat(item.price) * item.quantity).toFixed(2),
      })),
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
    });
  };

  const inputClass =
    "w-full bg-white border border-[oklch(0.88_0.015_75)] px-4 py-3 font-sans text-sm text-[oklch(0.18_0.015_60)] focus:outline-none focus:border-[oklch(0.62_0.12_70)] transition-colors";
  const labelClass =
    "font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.52_0.02_60)] block mb-2";

  return (
    <div className="min-h-screen pt-20">
      <div className="container py-12">
        <h1 className="font-serif text-4xl font-light text-[oklch(0.18_0.015_60)] mb-10">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact */}
              <div>
                <h2 className="font-serif text-xl font-medium text-[oklch(0.18_0.015_60)] mb-5 pb-3 border-b border-[oklch(0.88_0.015_75)]">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input
                      type="email"
                      required
                      value={form.customerEmail}
                      onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Phone</label>
                    <input
                      type="tel"
                      value={form.customerPhone}
                      onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div>
                <h2 className="font-serif text-xl font-medium text-[oklch(0.18_0.015_60)] mb-5 pb-3 border-b border-[oklch(0.88_0.015_75)]">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Street Address *</label>
                    <input
                      type="text"
                      required
                      value={form.shippingAddress}
                      onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>City</label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Country</label>
                      <input
                        type="text"
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Postal Code</label>
                      <input
                        type="text"
                        value={form.postalCode}
                        onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Order Notes (optional)</label>
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className={`${inputClass} resize-none`}
                      placeholder="Any special instructions..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[oklch(0.96_0.012_80)] border border-[oklch(0.88_0.015_75)] p-6 sticky top-24">
                <h2 className="font-serif text-xl font-medium text-[oklch(0.18_0.015_60)] mb-5">Your Order</h2>
                <div className="space-y-3 mb-5">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="w-12 h-14 bg-[oklch(0.92_0.012_80)] shrink-0 overflow-hidden">
                        {item.product?.imageUrl && (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-xs font-medium text-[oklch(0.18_0.015_60)] leading-snug truncate">
                          {item.product?.name}
                        </p>
                        {item.selectedSize && (
                          <p className="font-sans text-[10px] text-[oklch(0.52_0.02_60)]">{item.selectedSize}</p>
                        )}
                        <p className="font-sans text-[10px] text-[oklch(0.52_0.02_60)]">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-sans text-xs font-medium text-[oklch(0.38_0.07_55)] shrink-0">
                        KSh {(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[oklch(0.88_0.015_75)] pt-4 space-y-2 mb-5">
                  <div className="flex justify-between font-sans text-sm text-[oklch(0.38_0.04_60)]">
                    <span>Subtotal</span><span>KSh {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-sans text-sm text-[oklch(0.38_0.04_60)]">
                    <span>Shipping</span><span>{shipping === 0 ? "Free" : `KSh ${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between font-sans text-base font-semibold text-[oklch(0.18_0.015_60)] pt-2 border-t border-[oklch(0.88_0.015_75)]">
                    <span>Total</span><span>KSh {total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={placeOrder.isPending}
                  className="btn-luxury w-full"
                >
                  {placeOrder.isPending ? "Placing Order..." : "Place Order"}
                </button>
                <p className="font-sans text-[10px] text-center text-[oklch(0.62_0.02_60)] mt-3">
                  Secure checkout · No payment required for demo
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
