import { trpc } from "@/lib/trpc";
import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Search } from "lucide-react";

type FilterType = "all" | "featured" | "bestsellers";

export default function Shop() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const { data: products, isLoading } = trpc.products.list.useQuery();

  const filtered = products?.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.scentNotes ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "featured" && p.isFeatured) ||
      (filter === "bestsellers" && p.isBestseller);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-[oklch(0.96_0.012_80)] py-16 border-b border-[oklch(0.88_0.015_75)]">
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
              onChange={(e) => setSearch(e.target.value)}
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
              onClick={() => setFilter(f)}
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
            {filtered?.length ?? 0} products
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[oklch(0.94_0.012_80)] animate-pulse" />
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
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
