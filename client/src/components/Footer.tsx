import { Link } from "wouter";
import { Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[oklch(0.14_0.015_55)] text-[oklch(0.85_0.01_80)]">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <p className="font-serif text-2xl font-semibold text-white">OmaLuxe</p>
              <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-[oklch(0.72_0.12_75)]">
                Candles & Scents
              </p>
            </div>
            <p className="font-sans text-sm text-[oklch(0.65_0.01_75)] leading-relaxed max-w-xs">
              Handcrafted luxury candles that transform your space into a sanctuary of warmth, elegance, and unforgettable fragrance.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-[oklch(0.72_0.12_75/0.3)] flex items-center justify-center text-[oklch(0.72_0.12_75)] hover:bg-[oklch(0.72_0.12_75)] hover:text-white transition-all duration-200">
                <Instagram size={15} />
              </a>
              <a href="mailto:hello@omaluxe.com"
                className="w-9 h-9 rounded-full border border-[oklch(0.72_0.12_75/0.3)] flex items-center justify-center text-[oklch(0.72_0.12_75)] hover:bg-[oklch(0.72_0.12_75)] hover:text-white transition-all duration-200">
                <Mail size={15} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[oklch(0.72_0.12_75)] mb-5 font-medium">Shop</p>
            <ul className="space-y-3">
              {[
                { href: "/shop", label: "All Products" },
                { href: "/collections", label: "Collections" },
                { href: "/shop?filter=bestsellers", label: "Bestsellers" },
                { href: "/shop?filter=featured", label: "New Arrivals" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="font-sans text-sm text-[oklch(0.65_0.01_75)] hover:text-white transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[oklch(0.72_0.12_75)] mb-5 font-medium">Information</p>
            <ul className="space-y-3">
              {[
                { href: "/about", label: "Our Story" },
                { href: "/about#contact", label: "Contact Us" },
                { href: "/account", label: "My Orders" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="font-sans text-sm text-[oklch(0.65_0.01_75)] hover:text-white transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-[oklch(0.65_0.01_75)]">
                <Mail size={13} />
                <span className="font-sans text-sm">hello@omaluxe.com</span>
              </div>
              <div className="flex items-center gap-2 text-[oklch(0.65_0.01_75)]">
                <Phone size={13} />
                <span className="font-sans text-sm">+1 (555) 000-0000</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[oklch(0.72_0.12_75/0.15)] mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans text-xs text-[oklch(0.52_0.01_70)]">
            © {new Date().getFullYear()} OmaLuxe Candles and Scents. All rights reserved.
          </p>
          <p className="font-sans text-xs text-[oklch(0.52_0.01_70)]">
            Crafted with care · Premium quality · Luxury experience
          </p>
        </div>
      </div>
    </footer>
  );
}
