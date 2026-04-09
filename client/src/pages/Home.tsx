import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import ProductCard from "@/components/ProductCard";
import { Flame, Leaf, Award, ArrowRight } from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663535558553/KyKey2VrFEZNwKpbpdN6tN/hero-candle_55821378.jpg";
const LIFESTYLE_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663535558553/KyKey2VrFEZNwKpbpdN6tN/hero-lifestyle_9873737f.jpg";

export default function Home() {
  const { data: featured } = trpc.products.featured.useQuery();
  const { data: bestsellers } = trpc.products.bestsellers.useQuery();

  useEffect(() => {
    document.title = "OmaLuxe Candles and Scents | Luxury Candles";
    // Ensure meta description is set for SPA navigation
    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = "Shop OmaLuxe handcrafted luxury scented candles. Discover mood-inspired fragrances, premium wax candles, and curated scent collections delivered to your door.";
    }
    let metaKeywords = document.querySelector<HTMLMetaElement>('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.content = "luxury candles, scented candles, handcrafted candles, aromatherapy candles, OmaLuxe, candle shop, home fragrance, soy candles, wax candles, scent collections";
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="OmaLuxe hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.10_0.015_55/0.75)] via-[oklch(0.10_0.015_55/0.45)] to-transparent" />
        </div>

        {/* Content */}
        <div className="relative container">
          <div className="max-w-xl">
            <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-[oklch(0.72_0.12_75)] mb-6 animate-fade-in-up">
              Luxury Candles & Scents
            </p>
            <h1 className="font-serif text-5xl md:text-7xl font-light text-white leading-[1.05] mb-6 animate-fade-in-up animate-delay-100">
              Illuminate Your
              <br />
              <em className="font-medium text-[oklch(0.85_0.1_75)]">World</em>
            </h1>
            <p className="font-sans text-base text-[oklch(0.85_0.01_80)] leading-relaxed mb-10 max-w-sm animate-fade-in-up animate-delay-200">
              Handcrafted from the finest natural waxes and rare fragrance oils, each OmaLuxe candle is a sensory journey designed to transform your space.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in-up animate-delay-300">
              <Link href="/shop">
                <button className="btn-luxury">
                  Explore Collection
                </button>
              </Link>
              <Link href="/about">
                <button className="btn-luxury-outline border-white text-white hover:bg-white hover:text-[oklch(0.18_0.015_60)]">
                  Our Story
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in-up animate-delay-400">
          <span className="font-sans text-[9px] tracking-[0.25em] uppercase text-white/60">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent" />
        </div>
      </section>

      {/* ── Brand Values ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[oklch(0.96_0.012_80)]">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: <Leaf size={22} strokeWidth={1.5} />, title: "Natural Ingredients", desc: "100% natural soy and coconut wax, free from toxins and synthetic dyes." },
              { icon: <Flame size={22} strokeWidth={1.5} />, title: "Long Burn Time", desc: "Up to 80 hours of clean, even burn — crafted for lasting luxury." },
              { icon: <Award size={22} strokeWidth={1.5} />, title: "Artisan Crafted", desc: "Each candle is hand-poured in small batches with meticulous attention to detail." },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3 px-6">
                <div className="w-12 h-12 rounded-full bg-[oklch(0.72_0.12_75/0.12)] flex items-center justify-center text-[oklch(0.62_0.12_70)]">
                  {item.icon}
                </div>
                <h3 className="font-serif text-lg font-medium text-[oklch(0.18_0.015_60)]">{item.title}</h3>
                <p className="font-sans text-sm text-[oklch(0.52_0.02_60)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Collections ──────────────────────────────────────────────── */}
      {featured && featured.length > 0 && (
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-14">
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[oklch(0.62_0.12_70)] mb-3">Curated For You</p>
              <h2 className="font-serif text-4xl md:text-5xl font-light text-[oklch(0.18_0.015_60)]">
                Featured Collections
              </h2>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="h-px w-16 bg-[oklch(0.72_0.12_75/0.4)]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.72_0.12_75)]" />
                <div className="h-px w-16 bg-[oklch(0.72_0.12_75/0.4)]" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/shop">
                <button className="btn-luxury-outline">
                  View All Products <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Lifestyle Banner ──────────────────────────────────────────────────── */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={LIFESTYLE_IMAGE} alt="Lifestyle" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[oklch(0.10_0.015_55/0.65)]" />
        </div>
        <div className="relative container text-center">
          <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-[oklch(0.72_0.12_75)] mb-4">The OmaLuxe Experience</p>
          <h2 className="font-serif text-4xl md:text-6xl font-light text-white mb-6 leading-tight">
            "Every flame tells<br />
            <em className="font-medium">a story."</em>
          </h2>
          <p className="font-sans text-sm text-white/75 max-w-md mx-auto leading-relaxed mb-10">
            Our fragrances are inspired by the world's most beautiful places — from Moroccan rose gardens to Himalayan cedar forests.
          </p>
          <Link href="/about">
            <button className="btn-luxury-outline border-white text-white hover:bg-white hover:text-[oklch(0.18_0.015_60)]">
              Discover Our Story
            </button>
          </Link>
        </div>
      </section>

      {/* ── Bestsellers ───────────────────────────────────────────────────────── */}
      {bestsellers && bestsellers.length > 0 && (
        <section className="py-20 bg-[oklch(0.96_0.012_80)]">
          <div className="container">
            <div className="text-center mb-14">
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[oklch(0.62_0.12_70)] mb-3">Most Loved</p>
              <h2 className="font-serif text-4xl md:text-5xl font-light text-[oklch(0.18_0.015_60)]">
                Bestsellers
              </h2>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="h-px w-16 bg-[oklch(0.72_0.12_75/0.4)]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.72_0.12_75)]" />
                <div className="h-px w-16 bg-[oklch(0.72_0.12_75/0.4)]" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestsellers.slice(0, 4).map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Scent Finder CTA ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-[oklch(0.18_0.015_60)]">
        <div className="container text-center">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[oklch(0.72_0.12_75)] mb-4">AI-Powered</p>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-white mb-4">
            Find Your Perfect Scent
          </h2>
          <p className="font-sans text-sm text-[oklch(0.75_0.01_80)] max-w-md mx-auto mb-8 leading-relaxed">
            Not sure where to start? Let Oma, our AI scent advisor, guide you to the perfect fragrance based on your mood and preferences.
          </p>
          <Link href="/shop">
            <button className="btn-luxury bg-[oklch(0.72_0.12_75)] border-[oklch(0.72_0.12_75)] hover:bg-[oklch(0.62_0.12_70)] hover:border-[oklch(0.62_0.12_70)]">
              Talk to Oma ✦
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
