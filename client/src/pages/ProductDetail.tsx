import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { useParams, Link } from "wouter";
import { Minus, Plus, ShoppingBag, Clock, Leaf, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import WishlistButton from "@/components/WishlistButton";

export default function ProductDetail() {
  const params = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);

  const { data: product, isLoading } = trpc.products.bySlug.useQuery(
    { slug: params.slug ?? "" },
    { enabled: !!params.slug }
  );

  const utils = trpc.useUtils();
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success("Added to cart", {
        description: `${product?.name} has been added to your cart.`,
      });
    },
    onError: () => toast.error("Failed to add to cart"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[oklch(0.72_0.12_75)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl text-[oklch(0.52_0.02_60)]">Product not found</p>
          <Link href="/shop">
            <button className="btn-luxury mt-6">Back to Shop</button>
          </Link>
        </div>
      </div>
    );
  }

  const sizes = product.sizes as { label: string; price: number }[] | null;
  const effectivePrice = selectedPrice ?? parseFloat(product.price);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    if (sizes && sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addToCart.mutate({
      productId: product.id,
      quantity,
      selectedSize: selectedSize ?? undefined,
      price: effectivePrice.toFixed(2),
    });
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/shop">
            <button className="flex items-center gap-1 font-sans text-xs text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.38_0.07_55)] transition-colors">
              <ChevronLeft size={14} /> Back to Shop
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden bg-[oklch(0.96_0.012_80)]">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-serif text-8xl text-[oklch(0.72_0.12_75/0.2)]">🕯</span>
                </div>
              )}
            </div>
            {product.isBestseller && (
              <div className="absolute top-4 left-4 bg-[oklch(0.38_0.07_55)] text-white font-sans text-[9px] tracking-[0.15em] uppercase px-3 py-1.5">
                Bestseller
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-[oklch(0.62_0.12_70)] mb-3">
              {product.mood ? `${product.mood} · ` : ""}OmaLuxe Candles and Scents
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-[oklch(0.18_0.015_60)] mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <p className="font-sans text-2xl font-medium text-[oklch(0.38_0.07_55)] mb-6">
              KSh {effectivePrice.toFixed(2)}
            </p>

            {/* Description */}
            <p className="font-sans text-sm text-[oklch(0.38_0.04_60)] leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Scent Notes */}
            {product.scentNotes && (
              <div className="mb-8 p-5 bg-[oklch(0.96_0.012_80)] border-l-2 border-[oklch(0.72_0.12_75)]">
                <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[oklch(0.62_0.12_70)] mb-2">Scent Notes</p>
                <p className="font-sans text-sm text-[oklch(0.38_0.04_60)] leading-relaxed">{product.scentNotes}</p>
              </div>
            )}

            {/* Burn time */}
            {product.burnTime && (
              <div className="flex items-center gap-2 mb-6 font-sans text-sm text-[oklch(0.52_0.02_60)]">
                <Clock size={15} strokeWidth={1.5} className="text-[oklch(0.62_0.12_70)]" />
                <span>Burn time: <strong className="text-[oklch(0.38_0.04_60)]">{product.burnTime}</strong></span>
              </div>
            )}

            {/* Sizes */}
            {sizes && sizes.length > 0 && (
              <div className="mb-8">
                <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[oklch(0.52_0.02_60)] mb-3">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size.label}
                      onClick={() => {
                        setSelectedSize(size.label);
                        setSelectedPrice(size.price);
                      }}
                      className={`px-4 py-2.5 font-sans text-xs border transition-all duration-200 ${
                        selectedSize === size.label
                          ? "bg-[oklch(0.38_0.07_55)] text-white border-[oklch(0.38_0.07_55)]"
                          : "bg-white text-[oklch(0.38_0.04_60)] border-[oklch(0.88_0.015_75)] hover:border-[oklch(0.38_0.07_55)]"
                      }`}
                    >
                      {size.label} — KSh {size.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[oklch(0.52_0.02_60)] mb-3">Quantity</p>
              <div className="flex items-center gap-0 w-fit border border-[oklch(0.88_0.015_75)]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[oklch(0.38_0.04_60)] hover:bg-[oklch(0.94_0.012_80)] transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 h-10 flex items-center justify-center font-sans text-sm text-[oklch(0.18_0.015_60)] border-x border-[oklch(0.88_0.015_75)]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-[oklch(0.38_0.04_60)] hover:bg-[oklch(0.94_0.012_80)] transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Add to cart & Wishlist */}
            <div className="flex gap-3 items-center">
              <button
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                className="btn-luxury flex items-center justify-center gap-3 flex-1 md:flex-none"
              >
                <ShoppingBag size={16} />
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </button>
              <WishlistButton productId={product.id} variant="button" />
            </div>

            {/* Natural badge */}
            <div className="flex items-center gap-2 mt-6 font-sans text-xs text-[oklch(0.52_0.02_60)]">
              <Leaf size={13} strokeWidth={1.5} className="text-[oklch(0.62_0.12_70)]" />
              <span>100% natural soy wax · Lead-free cotton wick · Vegan & cruelty-free</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
