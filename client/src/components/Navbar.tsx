import { useAuth } from "@/_core/hooks/useAuth";
import NotificationPanel from "./NotificationPanel";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ShoppingBag, Menu, X, User, LogOut, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [location] = useLocation();

  const { data: cartItems } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/collections", label: "Collections" },
    { href: "/about", label: "Our Story" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[oklch(0.98_0.008_85/0.97)] backdrop-blur-md shadow-sm border-b border-[oklch(0.88_0.015_75)]"
          : "bg-transparent"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/">
            <div className="flex flex-col leading-none cursor-pointer">
              <span className={`font-serif text-xl font-semibold tracking-wide transition-colors duration-300 ${scrolled ? 'text-[oklch(0.18_0.015_60)]' : 'text-white'}`}>
                OmaLuxe
              </span>
              <span className={`font-sans text-[10px] tracking-[0.25em] uppercase font-medium transition-colors duration-300 ${scrolled ? 'text-[oklch(0.62_0.12_70)]' : 'text-[oklch(0.72_0.12_75)]'}`}>
                Candles & Scents
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`font-sans text-xs tracking-[0.15em] uppercase transition-colors duration-200 cursor-pointer ${
                    scrolled
                      ? location === link.href
                        ? 'text-[oklch(0.38_0.07_55)]'
                        : 'text-[oklch(0.38_0.04_60)] hover:text-[oklch(0.18_0.015_60)]'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <NotificationPanel />

            {/* Cart */}
            <Link href="/cart">
              <button className={`relative p-2 transition-colors ${scrolled ? 'text-[oklch(0.38_0.04_60)] hover:text-[oklch(0.18_0.015_60)]' : 'text-white/80 hover:text-white'}`}>
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[oklch(0.38_0.07_55)] text-white text-[9px] flex items-center justify-center font-sans font-medium">
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 p-2 transition-colors ${scrolled ? 'text-[oklch(0.38_0.04_60)] hover:text-[oklch(0.18_0.015_60)]' : 'text-white/80 hover:text-white'}`}
                >
                  <User size={20} strokeWidth={1.5} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[oklch(0.88_0.015_75)] shadow-lg rounded-sm py-1">
                    <div className="px-4 py-2 border-b border-[oklch(0.88_0.015_75)]">
                      <p className="font-sans text-xs text-[oklch(0.52_0.02_60)] truncate">{user?.name}</p>
                    </div>
                    <Link href="/account">
                      <button className="w-full flex items-center gap-2 px-4 py-2 font-sans text-xs text-[oklch(0.38_0.04_60)] hover:bg-[oklch(0.94_0.012_80)] transition-colors">
                        <User size={14} /> My Orders
                      </button>
                    </Link>
                    <Link href="/wishlist">
                      <button className="w-full flex items-center gap-2 px-4 py-2 font-sans text-xs text-[oklch(0.38_0.04_60)] hover:bg-[oklch(0.94_0.012_80)] transition-colors">
                        <span>❤️</span> My Wishlist
                      </button>
                    </Link>
                    {user?.role === "admin" && (
                      <Link href="/admin">
                        <button className="w-full flex items-center gap-2 px-4 py-2 font-sans text-xs text-[oklch(0.38_0.04_60)] hover:bg-[oklch(0.94_0.012_80)] transition-colors">
                          <Settings size={14} /> Admin Panel
                        </button>
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2 font-sans text-xs text-[oklch(0.38_0.04_60)] hover:bg-[oklch(0.94_0.012_80)] transition-colors"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a href={getLoginUrl()} className="hidden md:block btn-luxury text-xs py-2 px-5">
                Sign In
              </a>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 transition-colors ${scrolled ? 'text-[oklch(0.38_0.04_60)]' : 'text-white/80'}`}
            >
              {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[oklch(0.98_0.008_85)] border-t border-[oklch(0.88_0.015_75)]">
          <div className="container py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className="block font-sans text-xs tracking-[0.15em] uppercase text-[oklch(0.38_0.04_60)] py-2">
                  {link.label}
                </span>
              </Link>
            ))}
            {!isAuthenticated && (
              <a href={getLoginUrl()} className="btn-luxury text-center mt-2">
                Sign In
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
