import { useEffect } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/LoadingSkeletons";

export default function Scents() {
  const { data, isLoading } = trpc.products.page.useQuery({
    page: 1,
    pageSize: 24,
    category: "scents",
    filter: "all",
  });

  useEffect(() => {
    document.title = "Scents | OmaLuxe Candles and Scents";
  }, []);

  return (
    <div className="min-h-screen pt-20">
      <section className="border-b border-[oklch(0.88_0.015_75)] bg-[oklch(0.88_0.025_66/0.84)] py-20 md:py-24">
        <div className="container text-center">
          <p className="mb-4 font-sans text-[10px] tracking-[0.3em] uppercase text-[oklch(0.62_0.12_70)]">
            A new OmaLuxe collection
          </p>
          <div className="mb-5 flex items-center justify-center gap-4 text-[oklch(0.62_0.12_70)]">
            <div className="h-px w-16 bg-[oklch(0.72_0.12_75/0.4)]" />
            <Sparkles size={17} strokeWidth={1.4} aria-hidden="true" />
            <div className="h-px w-16 bg-[oklch(0.72_0.12_75/0.4)]" />
          </div>
          <h1 className="font-serif text-5xl font-light text-[oklch(0.18_0.015_60)] md:text-6xl">
            Scents
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-sans text-sm leading-relaxed text-[oklch(0.52_0.02_60)] md:text-base">
            A dedicated home for OmaLuxe fragrances, separate from our candle
            collection.
          </p>
          <span className="mt-7 inline-block border border-[oklch(0.72_0.12_75/0.55)] px-4 py-2 font-sans text-[10px] tracking-[0.2em] uppercase text-[oklch(0.38_0.07_55)]">
            Fragrance collection
          </span>
        </div>
      </section>

      <section className="container py-16 md:py-20">
        {isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : data?.items.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((product) => <ProductCard key={product.id} {...product} />)}
          </div>
        ) : (
        <div className="mx-auto max-w-3xl border border-[oklch(0.88_0.015_75)] bg-white px-6 py-10 text-center md:px-12 md:py-14">
          <p className="mb-3 font-sans text-[10px] tracking-[0.25em] uppercase text-[oklch(0.62_0.12_70)]">
            Standalone fragrance products
          </p>
          <h2 className="font-serif text-3xl font-light text-[oklch(0.18_0.015_60)] md:text-4xl">
            A new way to enjoy your favourite scents.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl font-sans text-sm leading-relaxed text-[oklch(0.52_0.02_60)]">
            We’re preparing a separate range that may include perfume, room and
            linen sprays, and fragrance oils. These products will appear here
            once their details and availability are ready.
          </p>
        </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/shop">
            <button className="btn-luxury-outline inline-flex items-center gap-2">
              Browse Candles <ArrowRight size={14} aria-hidden="true" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
