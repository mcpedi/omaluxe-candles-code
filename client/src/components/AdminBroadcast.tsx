import { useState } from "react";
import { Megaphone, Tag, Sparkles, Info, Send } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type BroadcastType = "promotion" | "new_arrival" | "system";

const typeOptions: { value: BroadcastType; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    value: "promotion",
    label: "Promotion / Offer",
    icon: <Tag size={14} />,
    desc: "Discounts, sales, or special deals",
  },
  {
    value: "new_arrival",
    label: "New Arrival",
    icon: <Sparkles size={14} />,
    desc: "New products or collections",
  },
  {
    value: "system",
    label: "System / General",
    icon: <Info size={14} />,
    desc: "General announcements or updates",
  },
];

export default function AdminBroadcast() {
  const [type, setType] = useState<BroadcastType>("promotion");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const broadcast = trpc.notifications.broadcast.useMutation({
    onSuccess: (data) => {
      toast.success(`Notification sent to ${data.sentTo} user${data.sentTo !== 1 ? "s" : ""}!`);
      setTitle("");
      setMessage("");
      setShowForm(false);
    },
    onError: () => toast.error("Failed to send broadcast notification."),
  });

  return (
    <div className="bg-white rounded-xl border border-[oklch(0.88_0.015_75)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[oklch(0.92_0.012_80)]">
        <div className="flex items-center gap-2">
          <Megaphone size={16} className="text-[oklch(0.38_0.07_55)]" />
          <h3 className="font-serif text-base font-semibold text-[oklch(0.18_0.015_60)]">
            Broadcast Notification
          </h3>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="font-sans text-[10px] tracking-[0.1em] uppercase text-[oklch(0.38_0.07_55)] hover:text-[oklch(0.28_0.05_55)] transition-colors"
        >
          {showForm ? "Cancel" : "New Broadcast"}
        </button>
      </div>

      {showForm && (
        <div className="p-5 space-y-4">
          <p className="font-sans text-xs text-[oklch(0.52_0.02_60)]">
            Send an in-app notification to all registered users instantly.
          </p>

          {/* Type selector */}
          <div>
            <label className="font-sans text-[10px] tracking-[0.12em] uppercase text-[oklch(0.52_0.02_60)] block mb-2">
              Notification Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-center transition-all ${
                    type === opt.value
                      ? "border-[oklch(0.38_0.07_55)] bg-[oklch(0.38_0.07_55/0.06)]"
                      : "border-[oklch(0.88_0.015_75)] hover:border-[oklch(0.38_0.07_55/0.4)]"
                  }`}
                >
                  <span className={type === opt.value ? "text-[oklch(0.38_0.07_55)]" : "text-[oklch(0.52_0.02_60)]"}>
                    {opt.icon}
                  </span>
                  <span className="font-sans text-[10px] font-medium text-[oklch(0.18_0.015_60)]">
                    {opt.label}
                  </span>
                  <span className="font-sans text-[9px] text-[oklch(0.65_0.015_70)]">
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="font-sans text-[10px] tracking-[0.12em] uppercase text-[oklch(0.52_0.02_60)] block mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Sale — 20% Off All Candles"
              maxLength={100}
              className="w-full font-sans text-xs px-3 py-2.5 border border-[oklch(0.88_0.015_75)] rounded-lg bg-[oklch(0.98_0.008_85)] text-[oklch(0.18_0.015_60)] placeholder:text-[oklch(0.65_0.015_70)] focus:outline-none focus:border-[oklch(0.38_0.07_55)] transition-colors"
            />
          </div>

          {/* Message */}
          <div>
            <label className="font-sans text-[10px] tracking-[0.12em] uppercase text-[oklch(0.52_0.02_60)] block mb-1.5">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your notification message here..."
              rows={3}
              maxLength={500}
              className="w-full font-sans text-xs px-3 py-2.5 border border-[oklch(0.88_0.015_75)] rounded-lg bg-[oklch(0.98_0.008_85)] text-[oklch(0.18_0.015_60)] placeholder:text-[oklch(0.65_0.015_70)] focus:outline-none focus:border-[oklch(0.38_0.07_55)] transition-colors resize-none"
            />
            <p className="font-sans text-[10px] text-[oklch(0.65_0.015_70)] mt-1 text-right">
              {message.length}/500
            </p>
          </div>

          {/* Send button */}
          <button
            onClick={() => {
              if (!title.trim() || !message.trim()) {
                toast.error("Please fill in both title and message.");
                return;
              }
              broadcast.mutate({ type, title: title.trim(), message: message.trim() });
            }}
            disabled={broadcast.isPending}
            className="btn-luxury w-full flex items-center justify-center gap-2"
          >
            {broadcast.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={14} />
            )}
            Send to All Users
          </button>
        </div>
      )}

      {!showForm && (
        <div className="px-5 py-4 text-center">
          <p className="font-sans text-xs text-[oklch(0.65_0.015_70)]">
            Send promotions, new arrivals, or announcements to all users at once.
          </p>
        </div>
      )}
    </div>
  );
}
