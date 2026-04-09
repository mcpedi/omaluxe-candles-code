import { useEffect, useRef, useState } from "react";
import { Bell, BellRing, Check, CheckCheck, Package, Tag, Sparkles, Info, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

type NotifType = "order_placed" | "order_updated" | "promotion" | "new_arrival" | "system";

const typeConfig: Record<NotifType, { icon: React.ReactNode; color: string; bg: string }> = {
  order_placed: {
    icon: <Package size={14} />,
    color: "text-[oklch(0.38_0.07_55)]",
    bg: "bg-[oklch(0.38_0.07_55/0.1)]",
  },
  order_updated: {
    icon: <Package size={14} />,
    color: "text-[oklch(0.45_0.12_200)]",
    bg: "bg-[oklch(0.45_0.12_200/0.1)]",
  },
  promotion: {
    icon: <Tag size={14} />,
    color: "text-[oklch(0.62_0.12_70)]",
    bg: "bg-[oklch(0.62_0.12_70/0.1)]",
  },
  new_arrival: {
    icon: <Sparkles size={14} />,
    color: "text-[oklch(0.55_0.1_65)]",
    bg: "bg-[oklch(0.55_0.1_65/0.1)]",
  },
  system: {
    icon: <Info size={14} />,
    color: "text-[oklch(0.45_0.05_60)]",
    bg: "bg-[oklch(0.45_0.05_60/0.1)]",
  },
};

export default function NotificationPanel() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: unreadData } = trpc.notifications.unreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000, // poll every 30s
  });

  const { data: notifs = [], isLoading } = trpc.notifications.list.useQuery(undefined, {
    enabled: isAuthenticated && open,
  });

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isAuthenticated) return null;

  const unreadCount = unreadData?.count ?? 0;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 transition-colors text-inherit hover:text-[oklch(0.38_0.07_55)]"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing size={20} strokeWidth={1.5} className="animate-[wiggle_0.5s_ease-in-out]" />
        ) : (
          <Bell size={20} strokeWidth={1.5} />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-[oklch(0.62_0.12_70)] text-white text-[9px] flex items-center justify-center font-sans font-semibold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-3 w-[360px] max-h-[480px] bg-white rounded-xl shadow-2xl border border-[oklch(0.88_0.015_75)] z-50 flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[oklch(0.92_0.012_80)]">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-[oklch(0.38_0.07_55)]" />
              <h3 className="font-serif text-sm font-semibold text-[oklch(0.18_0.015_60)]">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="font-sans text-[10px] bg-[oklch(0.38_0.07_55)] text-white px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  className="font-sans text-[10px] tracking-wide text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.38_0.07_55)] flex items-center gap-1 transition-colors"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.18_0.015_60)] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-[oklch(0.38_0.07_55)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Bell size={28} className="text-[oklch(0.78_0.015_75)]" />
                <p className="font-sans text-xs text-[oklch(0.52_0.02_60)]">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifs.map((notif) => {
                const cfg = typeConfig[notif.type as NotifType] ?? typeConfig.system;
                return (
                  <div
                    key={notif.id}
                    className={`flex gap-3 px-4 py-3 border-b border-[oklch(0.94_0.012_80)] transition-colors cursor-pointer ${
                      notif.isRead
                        ? "bg-white hover:bg-[oklch(0.98_0.008_85)]"
                        : "bg-[oklch(0.97_0.01_80)] hover:bg-[oklch(0.95_0.012_80)]"
                    }`}
                    onClick={() => {
                      if (!notif.isRead) markRead.mutate({ id: notif.id });
                    }}
                  >
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${cfg.bg} ${cfg.color}`}
                    >
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`font-sans text-xs font-medium leading-snug ${
                            notif.isRead
                              ? "text-[oklch(0.38_0.04_60)]"
                              : "text-[oklch(0.18_0.015_60)]"
                          }`}
                        >
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[oklch(0.62_0.12_70)] mt-1" />
                        )}
                      </div>
                      <p className="font-sans text-[11px] text-[oklch(0.52_0.02_60)] mt-0.5 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="font-sans text-[10px] text-[oklch(0.65_0.015_70)]">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </span>
                        {notif.orderId && (
                          <Link
                            href="/account"
                            onClick={() => setOpen(false)}
                            className="font-sans text-[10px] text-[oklch(0.38_0.07_55)] hover:underline"
                          >
                            View order →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-[oklch(0.92_0.012_80)] bg-[oklch(0.98_0.008_85)]">
            <Link
              href="/account/notifications"
              onClick={() => setOpen(false)}
              className="font-sans text-[10px] tracking-[0.1em] uppercase text-[oklch(0.38_0.07_55)] hover:text-[oklch(0.28_0.05_55)] transition-colors"
            >
              Manage notification preferences →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
