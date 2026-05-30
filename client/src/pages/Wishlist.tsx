import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Heart, ChevronLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";

export default function Wishlist() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const { data: wishlistItems, isLoading } = trpc.wishlist.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success("Added to cart");
    },
    onError: () => toast.error("Failed to add to cart"),
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
          <p className="font-serif text-2xl text-[oklch(0.52_0.02_60)] mb-4">Sign in to view your wishlist</p>
          <a href={getLoginUrl()}>
            <button className="btn-luxury">Sign In</button>
          </a>
        </div>
      </div>
    );
  }

  const items = wishlistItems || [];
  const validItems = items.filter((item) => item.product);

  return (
    <div className="min-h-screen pt-20 bg-[oklch(0.97_0.006_80)]">
      <div className="container py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/">
            <button className="flex items-center gap-1 font-sans text-xs text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.38_0.07_55)] transition-colors">
              <ChevronLeft size={14} /> Home
            </button>
          </Link>
          <span className="font-sans text-xs text-[oklch(0.62_0.12_70)]">/</span>
          <span className="font-sans text-xs text-[oklch(0.38_0.04_60)]">My Wishlist</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Heart size={28} fill="currentColor" className="text-red-500" strokeWidth={1.5} />
            <h1 className="font-serif text-4xl font-light text-[oklch(0.18_0.015_60)]">My Wishlist</h1>
          </div>
          <p className="font-sans text-sm text-[oklch(0.52_0.02_60)]">
            {validItems.length} {validItems.length === 1 ? "candle" : "candles"} saved
          </p>
        </div>

        {/* Empty state */}
        {validItems.length === 0 ? (
          <div className="bg-white border border-[oklch(0.88_0.015_75)] p-12 text-center">
            <Heart size={48} className="mx-auto mb-4 text-[oklch(0.72_0.12_75)]" strokeWidth={1} />
            <p className="font-serif text-xl text-[oklch(0.52_0.02_60)] mb-2">Your wishlist is empty</p>
            <p className="font-sans text-sm text-[oklch(0.62_0.12_70)] mb-6">
              Explore our collection and heart your favorite candles to save them here.
            </p>
            <Link href="/shop">
              <button className="btn-luxury">Explore Collection</button>
            </Link>
          </div>
        ) : (
          <>
            {/* Wishlist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {validItems.map((item) => {
                const product = item.product!;
                return (
                  <div key={item.id} className="group">
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      slug={product.slug}
                      price={product.price}
                      imageUrl={product.imageUrl}
                      scentNotes={product.scentNotes}
                      isBestseller={product.isBestseller}
                      isFeatured={product.isFeatured}
                      showWishlist={true}
                      onAddToCart={() => {
                        addToCart.mutate({
                          productId: product.id,
                          quantity: 1,
                          price: product.price,
                        });
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Continue Shopping */}
            <div className="text-center">
              <Link href="/shop">
                <button className="btn-luxury-outline">Continue Shopping</button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
