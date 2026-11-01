import { Link } from "wouter";
import { Eye, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import WishlistButton from "./WishlistButton";
import { trpc } from "@/lib/trpc";
import { getReviewSummaryLabel } from "@/lib/reviewSummary";
import QuickViewDialog from "./QuickViewDialog";

interface ProductCardProps {
  id: number;
  name: string;
  slug: string;
  price: string;
  imageUrl?: string | null;
  description?: string | null;
  scentNotes?: string | null;
  burnTime?: string | null;
  mood?: string | null;
  sizes?: { label: string; price: number }[] | null;
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
  description,
  scentNotes,
  burnTime,
  mood,
  sizes,
  isBestseller,
  isFeatured,
  onAddToCart,
  showWishlist = true,
}: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { data: ratingData, isLoading: ratingLoading, isError: ratingError } =
    trpc.reviews.averageRating.useQuery({ productId: id });
  const reviewSummaryLabel = getReviewSummaryLabel(ratingData, {
    isLoading: ratingLoading,
    isError: ratingError,
  });

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
        <div
          className="flex items-center gap-1.5 mb-2 min-h-4"
          aria-label={reviewSummaryLabel}
          aria-busy={ratingLoading}
        >
          {ratingData?.totalReviews ? (
            <>
              <Star size={12} fill="currentColor" className="text-[oklch(0.72_0.12_75)]" />
              <span className="font-sans text-[11px] text-[oklch(0.38_0.07_55)]">
                {ratingData.avgRating.toFixed(1)}
              </span>
              <span className="font-sans text-[11px] text-[oklch(0.52_0.02_60)]">
                ({ratingData.totalReviews})
              </span>
            </>
          ) : ratingLoading ? (
            <span className="font-sans text-[10px] text-[oklch(0.58_0.02_60)]">Loading reviews…</span>
          ) : ratingError ? (
            <span className="font-sans text-[10px] text-[oklch(0.58_0.02_60)]">Reviews unavailable</span>
          ) : (
            <span className="font-sans text-[10px] text-[oklch(0.58_0.02_60)]">No reviews yet</span>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-sans text-sm font-medium text-[oklch(0.38_0.07_55)]">
            From KSh {parseFloat(price).toFixed(2)}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuickViewOpen(true)}
              className="font-sans text-[10px] tracking-[0.1em] uppercase text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.38_0.07_55)] transition-colors inline-flex items-center gap-1"
              aria-label={`Quick view ${name}`}
            >
              <Eye size={12} /> Quick View
            </button>
            <Link href={`/product/${slug}`}>
              <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.38_0.07_55)] transition-colors cursor-pointer">
                View →
              </span>
            </Link>
          </div>
        </div>
      </div>
      <QuickViewDialog
        product={{ id, name, slug, price, imageUrl, description, scentNotes, burnTime, mood, sizes }}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </div>
  );
}
