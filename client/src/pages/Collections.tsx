import { Link } from "wouter";

const collections = [
  {
    title: "Romantic Evenings",
    description: "Rich, sensual fragrances for intimate moments — rose, oud, jasmine, and amber.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663535558553/KyKey2VrFEZNwKpbpdN6tN/candle-7_2da19a79.jpg",
    filter: "romantic",
    href: "/shop?mood=romantic",
  },
  {
    title: "Calm & Serenity",
    description: "Grounding, meditative scents to quiet the mind — cedar, sage, white tea, and iris.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663535558553/KyKey2VrFEZNwKpbpdN6tN/candle-4_403d6beb.jpg",
    filter: "calm",
    href: "/shop?mood=calm",
  },
  {
    title: "Cosy Warmth",
    description: "Comforting, enveloping aromas for cold evenings — vanilla, amber, and tonka.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663535558553/KyKey2VrFEZNwKpbpdN6tN/candle-3_c4b79e22.jpg",
    filter: "cosy",
    href: "/shop?mood=cosy",
  },
  {
    title: "Energising Mornings",
    description: "Bright, uplifting citrus and floral blends to start your day with clarity.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663535558553/KyKey2VrFEZNwKpbpdN6tN/candle-8_a981bc9b.jpg",
    filter: "energising",
    href: "/shop?mood=energising",
  },
  {
    title: "Mysterious Depths",
    description: "Dark, opulent fragrances for those who dare — orchid, truffle, and patchouli.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663535558553/KyKey2VrFEZNwKpbpdN6tN/candle-2_8135761e.jpg",
    filter: "mysterious",
    href: "/shop?mood=mysterious",
  },
  {
    title: "Gift Collections",
    description: "Curated sets and gift boxes — the perfect luxury gift for any occasion.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663535558553/KyKey2VrFEZNwKpbpdN6tN/candle-9_72611a64.jpg",
    filter: "gift",
    href: "/shop",
  },
];

export default function Collections() {
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-[oklch(0.96_0.012_80)] py-16 border-b border-[oklch(0.88_0.015_75)]">
        <div className="container text-center">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[oklch(0.62_0.12_70)] mb-3">Explore</p>
          <h1 className="font-serif text-5xl font-light text-[oklch(0.18_0.015_60)]">Our Collections</h1>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-16 bg-[oklch(0.72_0.12_75/0.4)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.72_0.12_75)]" />
            <div className="h-px w-16 bg-[oklch(0.72_0.12_75/0.4)]" />
          </div>
          <p className="font-sans text-sm text-[oklch(0.52_0.02_60)] max-w-md mx-auto mt-5 leading-relaxed">
            Each collection is a curated mood — a fragrance story designed to transform your space and elevate your everyday.
          </p>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((col) => (
            <Link key={col.title} href={col.href}>
              <div className="group cursor-pointer card-hover overflow-hidden border border-[oklch(0.88_0.015_75)]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={col.image}
                    alt={col.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.10_0.015_55/0.7)] via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-serif text-xl font-medium text-white mb-1">{col.title}</h3>
                  </div>
                </div>
                <div className="p-5 bg-white">
                  <p className="font-sans text-sm text-[oklch(0.52_0.02_60)] leading-relaxed mb-3">{col.description}</p>
                  <span className="font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.62_0.12_70)] group-hover:text-[oklch(0.38_0.07_55)] transition-colors">
                    Explore Collection →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
