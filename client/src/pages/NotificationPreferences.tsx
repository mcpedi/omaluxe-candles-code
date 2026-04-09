import { useEffect, useState } from "react";
import { Bell, Package, Tag, Sparkles, ArrowLeft, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function NotificationPreferences() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const { data: prefs, isLoading } = trpc.notifications.preferences.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const [newArrivals, setNewArrivals] = useState(true);

  useEffect(() => {
    if (prefs) {
      setOrderUpdates(prefs.orderUpdates);
      setPromotions(prefs.promotions);
      setNewArrivals(prefs.newArrivals);
    }
  }, [prefs]);

  const updatePrefs = trpc.notifications.preferences.update.useMutation({
    onSuccess: () => {
      utils.notifications.preferences.get.invalidate();
      toast.success("Notification preferences saved.");
    },
    onError: () => toast.error("Failed to save preferences."),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[oklch(0.38_0.07_55)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Bell size={40} className="text-[oklch(0.78_0.015_75)]" />
        <h2 className="font-serif text-2xl text-[oklch(0.18_0.015_60)]">Sign in to manage notifications</h2>
        <a href={getLoginUrl()} className="btn-luxury">Sign In</a>
      </div>
    );
  }

  const prefItems = [
    {
      key: "orderUpdates" as const,
      icon: <Package size={20} className="text-[oklch(0.38_0.07_55)]" />,
      label: "Order Updates",
      description: "Receive notifications when your order is confirmed, shipped, or delivered.",
      value: orderUpdates,
      setter: setOrderUpdates,
    },
    {
      key: "promotions" as const,
      icon: <Tag size={20} className="text-[oklch(0.62_0.12_70)]" />,
      label: "Promotions & Offers",
      description: "Be the first to know about exclusive discounts, seasonal sales, and special offers.",
      value: promotions,
      setter: setPromotions,
    },
    {
      key: "newArrivals" as const,
      icon: <Sparkles size={20} className="text-[oklch(0.55_0.1_65)]" />,
      label: "New Arrivals",
      description: "Get notified when new candle collections and limited editions are released.",
      value: newArrivals,
      setter: setNewArrivals,
    },
  ];

  return (
    <div className="min-h-screen bg-[oklch(0.98_0.008_85)] py-16">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back link */}
        <Link href="/account" className="inline-flex items-center gap-2 font-sans text-xs tracking-[0.1em] uppercase text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.38_0.07_55)] transition-colors mb-8">
          <ArrowLeft size={14} />
          Back to Account
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[oklch(0.38_0.07_55/0.1)] flex items-center justify-center">
              <Bell size={18} className="text-[oklch(0.38_0.07_55)]" />
            </div>
            <h1 className="font-serif text-3xl text-[oklch(0.18_0.015_60)]">Notification Preferences</h1>
          </div>
          <p className="font-sans text-sm text-[oklch(0.52_0.02_60)] leading-relaxed">
            Choose which in-app notifications you'd like to receive. You can update these at any time.
          </p>
        </div>

        {/* Preference cards */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[oklch(0.38_0.07_55)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {prefItems.map((item) => (
              <div
                key={item.key}
                className={`bg-white rounded-xl border p-5 flex items-start gap-4 transition-all duration-200 cursor-pointer ${
                  item.value
                    ? "border-[oklch(0.38_0.07_55/0.4)] shadow-sm"
                    : "border-[oklch(0.88_0.015_75)]"
                }`}
                onClick={() => item.setter(!item.value)}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[oklch(0.96_0.012_80)] flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-base font-semibold text-[oklch(0.18_0.015_60)]">
                      {item.label}
                    </h3>
                    {/* Toggle */}
                    <div
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                        item.value ? "bg-[oklch(0.38_0.07_55)]" : "bg-[oklch(0.85_0.015_75)]"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                          item.value ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                  <p className="font-sans text-xs text-[oklch(0.52_0.02_60)] mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Save button */}
        <button
          onClick={() =>
            updatePrefs.mutate({ orderUpdates, promotions, newArrivals })
          }
          disabled={updatePrefs.isPending}
          className="btn-luxury w-full flex items-center justify-center gap-2"
        >
          {updatePrefs.isPending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check size={15} />
          )}
          Save Preferences
        </button>

        {/* Info note */}
        <p className="font-sans text-[11px] text-[oklch(0.65_0.015_70)] text-center mt-4 leading-relaxed">
          These preferences control in-app notifications only. Order confirmations are always sent regardless of settings.
        </p>
      </div>
    </div>
  );
}
