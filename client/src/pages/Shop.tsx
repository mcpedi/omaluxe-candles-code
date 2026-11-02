import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/LoadingSkeletons";
import { Loader2, Search } from "lucide-react";

type FilterType = "all" | "featured" | "bestsellers";

export default function Shop() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loadedProducts, setLoadedProducts] = useState<any[]>([]);

  const { data: pageData, isLoading, isFetching } = trpc.products.page.useQuery({
    page,
    pageSize: 8,
    search: search.trim() || undefined,
    filter,
  });

  useEffect(() => {
    if (!pageData) return;
    setLoadedProducts((current) => {
      if (pageData.page === 1) return pageData.items;
      const existingIds = new Set(current.map((product) => product.id));
      return [...current, ...pageData.items.filter((product) => !existingIds.has(product.id))];
    });
  }, [pageData]);

  const resetCatalog = () => {
    setPage(1);
    setLoadedProducts([]);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-[oklch(0.88_0.025_66/0.84)] py-16 border-b border-[oklch(0.88_0.015_75)]">
        <div className="container text-center">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[oklch(0.62_0.12_70)] mb-3">Discover</p>
          <h1 className="font-serif text-5xl font-light text-[oklch(0.18_0.015_60)]">Our Collection</h1>
          <div className="flex items-center justify-center gap-4 mt-4 mb-8">
            <div className="h-px w-16 bg-[oklch(0.72_0.12_75/0.4)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.72_0.12_75)]" />
            <div className="h-px w-16 bg-[oklch(0.72_0.12_75/0.4)]" />
          </div>
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[oklch(0.62_0.12_70)]" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search by name or scent..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetCatalog();
              }}
              className="w-full bg-white border border-[oklch(0.88_0.015_75)] pl-10 pr-4 py-3 font-sans text-sm text-[oklch(0.18_0.015_60)] focus:outline-none focus:border-[oklch(0.62_0.12_70)] transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="container py-12">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-10 border-b border-[oklch(0.88_0.015_75)]">
          {(["all", "featured", "bestsellers"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                resetCatalog();
              }}
              className={`font-sans text-xs tracking-[0.15em] uppercase px-6 py-3 transition-all duration-200 border-b-2 -mb-px ${
                filter === f
                  ? "border-[oklch(0.38_0.07_55)] text-[oklch(0.38_0.07_55)]"
                  : "border-transparent text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.18_0.015_60)]"
              }`}
            >
              {f === "all" ? "All Products" : f === "featured" ? "New Arrivals" : "Bestsellers"}
            </button>
          ))}
          <div className="ml-auto font-sans text-xs text-[oklch(0.52_0.02_60)]">
            {pageData?.total ?? 0} products
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <ProductGridSkeleton />
        ) : loadedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loadedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
            </div>
            {pageData?.hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  type="button"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={isFetching}
                  className="btn-luxury-outline min-w-44 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isFetching && <Loader2 size={14} className="animate-spin" />}
                  {isFetching ? "Loading products…" : "Load More Products"}
                </button>
              </div>
            )}
            {pageData && !pageData.hasMore && loadedProducts.length > 0 && (
              <p className="text-center mt-10 font-sans text-xs text-[oklch(0.58_0.02_60)]" aria-live="polite">
                You&apos;ve reached the end of the collection.
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="font-serif text-2xl text-[oklch(0.52_0.02_60)] mb-2">No products found</p>
            <p className="font-sans text-sm text-[oklch(0.62_0.02_60)]">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
