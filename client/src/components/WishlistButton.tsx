import { Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface WishlistButtonProps {
  productId: number;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "button";
}

export default function WishlistButton({ productId, size = "md", variant = "icon" }: WishlistButtonProps) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: wishlistStatus } = trpc.wishlist.isWishlisted.useQuery(
    { productId },
    { enabled: isAuthenticated }
  );

  const addToWishlist = trpc.wishlist.add.useMutation({
    onSuccess: () => {
      utils.wishlist.isWishlisted.invalidate();
      utils.wishlist.count.invalidate();
      toast.success("Added to wishlist ♥");
    },
    onError: () => toast.error("Failed to add to wishlist"),
  });

  const removeFromWishlist = trpc.wishlist.remove.useMutation({
    onSuccess: () => {
      utils.wishlist.isWishlisted.invalidate();
      utils.wishlist.count.invalidate();
      toast.success("Removed from wishlist");
    },
    onError: () => toast.error("Failed to remove from wishlist"),
  });

  const isWishlisted = wishlistStatus?.isWishlisted ?? false;
  const isLoading = addToWishlist.isPending || removeFromWishlist.isPending;

  const handleClick = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (isWishlisted) {
      removeFromWishlist.mutate({ productId });
    } else {
      addToWishlist.mutate({ productId });
    }
  };

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`${sizeClasses[size]} flex items-center justify-center transition-all duration-200 ${
          isWishlisted
            ? "text-red-500"
            : "text-[oklch(0.62_0.12_70)] hover:text-red-500"
        } disabled:opacity-50`}
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          size={size === "sm" ? 16 : size === "md" ? 20 : 24}
          fill={isWishlisted ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 border border-[oklch(0.88_0.015_75)] hover:border-[oklch(0.62_0.12_70)] transition-colors disabled:opacity-50"
    >
      <Heart
        size={18}
        fill={isWishlisted ? "currentColor" : "none"}
        strokeWidth={1.5}
        className={isWishlisted ? "text-red-500" : "text-[oklch(0.62_0.12_70)]"}
      />
      <span className="font-sans text-sm text-[oklch(0.38_0.04_60)]">
        {isWishlisted ? "In Wishlist" : "Add to Wishlist"}
      </span>
    </button>
  );
}
