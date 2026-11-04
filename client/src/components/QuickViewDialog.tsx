import { useState } from "react";
import { Clock, Leaf, Loader2, Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { addGuestCartItem } from "@/lib/guestCart";
import { getQuickViewPrice, needsQuickViewSizeSelection } from "@/lib/quickView";
import WishlistButton from "./WishlistButton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface QuickViewProduct {
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
}

interface QuickViewDialogProps {
  product: QuickViewProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickViewDialog({ product, open, onOpenChange }: QuickViewDialogProps) {
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const utils = trpc.useUtils();
  const sizes = product.sizes ?? [];
  const effectivePrice = getQuickViewPrice(product.price, selectedPrice);

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success("Added to cart", { description: `${product.name} has been added to your cart.` });
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to add to cart"),
  });

  const handleAddToCart = () => {
    if (needsQuickViewSizeSelection(sizes, selectedSize)) {
      toast.error("Please select a size");
      return;
    }
    if (!isAuthenticated) {
      addGuestCartItem({
        productId: product.id,
        productName: product.name,
        imageUrl: product.imageUrl,
        quantity,
        selectedSize: selectedSize ?? undefined,
        price: effectivePrice.toFixed(2),
      });
      toast.success("Added to cart", { description: `${product.name} has been added to your cart.` });
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[oklch(0.91_0.018_72/0.96)] border-[oklch(0.88_0.015_75)] p-0 overflow-hidden sm:max-w-3xl ease-out duration-300 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-bottom-2 data-[state=closed]:duration-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 max-h-[90vh] overflow-y-auto">
          <div className="relative aspect-[4/5] sm:aspect-auto min-h-72 bg-[oklch(0.85_0.025_66/0.86)]">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-serif text-8xl text-[oklch(0.72_0.12_75/0.25)]">🕯</span>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <WishlistButton productId={product.id} size="md" />
            </div>
          </div>

          <div className="p-6 sm:p-8 flex flex-col">
            <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-[oklch(0.62_0.12_70)] mb-2">
              {product.mood ? `${product.mood} · ` : ""}Quick View
            </p>
            <DialogTitle className="font-serif text-3xl font-light leading-tight text-[oklch(0.18_0.015_60)] pr-6">
              {product.name}
            </DialogTitle>
            <DialogDescription className="sr-only">Quick product details for {product.name}</DialogDescription>

            <div className="flex items-center gap-2 mt-3 mb-4">
              <Star size={13} fill="currentColor" className="text-[oklch(0.72_0.12_75)]" />
              <span className="font-sans text-xs text-[oklch(0.52_0.02_60)]">View ratings and reviews on the full product page</span>
            </div>

            <p className="font-sans text-2xl font-medium text-[oklch(0.38_0.07_55)] mb-5">
              KSh {effectivePrice.toFixed(2)}
            </p>
            <p className="font-sans text-sm leading-relaxed text-[oklch(0.38_0.04_60)] mb-5 line-clamp-4">
              {product.description || "A luxurious OmaLuxe fragrance, handcrafted to transform your space."}
            </p>

            {product.scentNotes && (
              <div className="p-4 mb-4 bg-[oklch(0.85_0.025_66/0.86)] border-l-2 border-[oklch(0.72_0.12_75)]">
                <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[oklch(0.62_0.12_70)] mb-1">Scent Notes</p>
                <p className="font-sans text-xs leading-relaxed text-[oklch(0.38_0.04_60)]">{product.scentNotes}</p>
              </div>
            )}

            {product.burnTime && (
              <div className="flex items-center gap-2 mb-5 font-sans text-xs text-[oklch(0.52_0.02_60)]">
                <Clock size={14} className="text-[oklch(0.62_0.12_70)]" />
                Burn time: <strong className="text-[oklch(0.38_0.04_60)]">{product.burnTime}</strong>
              </div>
            )}

            {sizes.length > 0 && (
              <div className="mb-5">
                <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[oklch(0.52_0.02_60)] mb-2">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size.label}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size.label);
                        setSelectedPrice(size.price);
                      }}
                      className={`px-3 py-2 font-sans text-xs border transition-colors ${selectedSize === size.label ? "bg-[oklch(0.38_0.07_55)] text-white border-[oklch(0.38_0.07_55)]" : "bg-white text-[oklch(0.38_0.04_60)] border-[oklch(0.88_0.015_75)] hover:border-[oklch(0.38_0.07_55)]"}`}
                    >
                      {size.label} — KSh {size.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mt-auto pt-3">
              <div className="flex items-center border border-[oklch(0.88_0.015_75)] bg-white">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-10 flex items-center justify-center" aria-label="Decrease quantity"><Minus size={13} /></button>
                <span className="w-8 text-center font-sans text-sm">{quantity}</span>
                <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-8 h-10 flex items-center justify-center" aria-label="Increase quantity"><Plus size={13} /></button>
              </div>
              <button type="button" onClick={handleAddToCart} disabled={addToCart.isPending} className="btn-luxury flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
                {addToCart.isPending ? <Loader2 size={15} className="animate-spin" /> : <ShoppingBag size={15} />}
                {addToCart.isPending ? "Adding…" : "Add to Cart"}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-4 font-sans text-[10px] text-[oklch(0.52_0.02_60)]">
              <Leaf size={13} className="text-[oklch(0.62_0.12_70)]" />
              100% natural soy wax · Lead-free cotton wick
            </div>
            <DialogClose asChild>
              <Link href={`/product/${product.slug}`} className="mt-4 text-center font-sans text-xs tracking-[0.12em] uppercase text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.38_0.07_55)]">
                View Full Details →
              </Link>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
