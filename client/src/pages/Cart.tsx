import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: cartItems, isLoading } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateItem = trpc.cart.update.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
    onError: () => toast.error("Failed to update cart"),
  });

  const removeItem = trpc.cart.remove.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
    onError: () => toast.error("Failed to remove item"),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={48} strokeWidth={1} className="mx-auto mb-4 text-[oklch(0.72_0.12_75)]" />
          <h2 className="font-serif text-3xl font-light text-[oklch(0.18_0.015_60)] mb-3">Your Cart</h2>
          <p className="font-sans text-sm text-[oklch(0.52_0.02_60)] mb-6">Please sign in to view your cart</p>
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

  const subtotal = cartItems?.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  ) ?? 0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={64} strokeWidth={0.8} className="mx-auto mb-6 text-[oklch(0.72_0.12_75/0.4)]" />
          <h2 className="font-serif text-3xl font-light text-[oklch(0.18_0.015_60)] mb-3">Your cart is empty</h2>
          <p className="font-sans text-sm text-[oklch(0.52_0.02_60)] mb-8">Discover our collection of luxury candles</p>
          <Link href="/shop">
            <button className="btn-luxury">Explore Collection</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container py-12">
        <h1 className="font-serif text-4xl font-light text-[oklch(0.18_0.015_60)] mb-10">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-0 divide-y divide-[oklch(0.88_0.015_75)] border-t border-b border-[oklch(0.88_0.015_75)]">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-5 py-6">
                {/* Image */}
                <div className="w-24 h-28 bg-[oklch(0.96_0.012_80)] shrink-0 overflow-hidden">
                  {item.product?.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🕯</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-lg font-medium text-[oklch(0.18_0.015_60)] leading-snug">
                        {item.product?.name ?? "Product"}
                      </h3>
                      {item.selectedSize && (
                        <p className="font-sans text-xs text-[oklch(0.52_0.02_60)] mt-0.5">{item.selectedSize}</p>
                      )}
                    </div>
                    <p className="font-sans text-sm font-medium text-[oklch(0.38_0.07_55)] shrink-0">
                      KSh {(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <p className="font-sans text-xs text-[oklch(0.62_0.02_60)] mt-1">
                    KSh {parseFloat(item.price).toFixed(2)} each
                  </p>

                  {/* Quantity + Remove */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border border-[oklch(0.88_0.015_75)]">
                      <button
                        onClick={() => updateItem.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                        className="w-8 h-8 flex items-center justify-center text-[oklch(0.52_0.02_60)] hover:bg-[oklch(0.94_0.012_80)] transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 h-8 flex items-center justify-center font-sans text-sm text-[oklch(0.18_0.015_60)] border-x border-[oklch(0.88_0.015_75)]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                        className="w-8 h-8 flex items-center justify-center text-[oklch(0.52_0.02_60)] hover:bg-[oklch(0.94_0.012_80)] transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem.mutate({ id: item.id })}
                      className="flex items-center gap-1 font-sans text-xs text-[oklch(0.52_0.02_60)] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[oklch(0.96_0.012_80)] border border-[oklch(0.88_0.015_75)] p-6 sticky top-24">
              <h2 className="font-serif text-xl font-medium text-[oklch(0.18_0.015_60)] mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between font-sans text-sm text-[oklch(0.38_0.04_60)]">
                  <span>Subtotal</span>
                  <span>KSh {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-sans text-sm text-[oklch(0.38_0.04_60)]">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `KSh ${shipping.toFixed(2)}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="font-sans text-[10px] text-[oklch(0.62_0.12_70)]">
                    Free shipping on orders over KSh 10,000
                  </p>
                )}
              </div>
              <div className="border-t border-[oklch(0.88_0.015_75)] pt-4 mb-6">
                <div className="flex justify-between font-sans text-base font-medium text-[oklch(0.18_0.015_60)]">
                  <span>Total</span>
                  <span>KSh {total.toFixed(2)}</span>
                </div>
              </div>
              <Link href="/checkout">
                <button className="btn-luxury w-full flex items-center justify-center gap-2">
                  Proceed to Checkout <ArrowRight size={14} />
                </button>
              </Link>
              <Link href="/shop">
                <button className="w-full mt-3 font-sans text-xs text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.38_0.07_55)] transition-colors py-2">
                  ← Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
