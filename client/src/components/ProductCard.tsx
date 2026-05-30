import { Link } from "wouter";
import { ShoppingBag } from "lucide-react";
import WishlistButton from "./WishlistButton";

interface ProductCardProps {
  id: number;
  name: string;
  slug: string;
  price: string;
  imageUrl?: string | null;
  scentNotes?: string | null;
  isBestseller?: boolean;
  isFeatured?: boolean;
  onAddToCart?: () => void;
  showWishlist?: boolean;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  imageUrl,
  scentNotes,
  isBestseller,
  isFeatured,
  onAddToCart,
  showWishlist = true,
}: ProductCardProps) {
  return (
    <div className="group card-hover bg-white border border-[oklch(0.88_0.015_75)] overflow-hidden">
      {/* Image */}
      <Link href={`/product/${slug}`}>
        <div className="relative overflow-hidden aspect-[3/4] bg-[oklch(0.96_0.008_80)] cursor-pointer">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-serif text-4xl text-[oklch(0.72_0.12_75/0.3)]">🕯</span>
            </div>
          )}
          {/* Wishlist button */}
          {showWishlist && (
            <div className="absolute top-3 right-3">
              <WishlistButton productId={id} size="md" />
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {isBestseller && (
              <span className="font-sans text-[9px] tracking-[0.15em] uppercase bg-[oklch(0.38_0.07_55)] text-white px-2 py-1">
                Bestseller
              </span>
            )}
            {isFeatured && !isBestseller && (
              <span className="font-sans text-[9px] tracking-[0.15em] uppercase bg-[oklch(0.72_0.12_75)] text-white px-2 py-1">
                Featured
              </span>
            )}
          </div>
          {/* Quick add overlay */}
          {onAddToCart && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart();
                }}
                className="w-full bg-[oklch(0.18_0.015_60)] text-white font-sans text-xs tracking-[0.12em] uppercase py-3 flex items-center justify-center gap-2 hover:bg-[oklch(0.38_0.07_55)] transition-colors"
              >
                <ShoppingBag size={14} />
                Quick Add
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link href={`/product/${slug}`}>
          <h3 className="font-serif text-lg font-medium text-[oklch(0.18_0.015_60)] hover:text-[oklch(0.38_0.07_55)] transition-colors cursor-pointer leading-snug mb-1">
            {name}
          </h3>
        </Link>
        {scentNotes && (
          <p className="font-sans text-xs text-[oklch(0.52_0.02_60)] line-clamp-1 mb-2">
            {scentNotes.split("|")[0]?.trim()}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="font-sans text-sm font-medium text-[oklch(0.38_0.07_55)]">
            From KSh {parseFloat(price).toFixed(2)}
          </span>
          <Link href={`/product/${slug}`}>
            <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.38_0.07_55)] transition-colors cursor-pointer">
              View →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
