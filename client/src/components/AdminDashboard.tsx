import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Plus, Edit2, Trash2, Send, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type DashboardTab =
  | "analytics"
  | "revenue"
  | "inventory"
  | "customers"
  | "coupons"
  | "products"
  | "orders"
  | "email";

const COLORS = [
  "oklch(0.72 0.12 75)",
  "oklch(0.62 0.1 65)",
  "oklch(0.52 0.08 55)",
  "oklch(0.42 0.06 45)",
  "oklch(0.32 0.04 35)",
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<DashboardTab>("analytics");
  const [couponForm, setCouponForm] = useState({
    code: "",
    discountType: "percentage" as const,
    discountValue: 10,
    maxUses: 100,
  });
  const [emailForm, setEmailForm] = useState({
    subject: "",
    message: "",
  });

  // Fetch all data
  const { data: analytics } = trpc.admin.analytics.sales.useQuery();
  const { data: revenueData } = trpc.admin.analytics.revenueByDate.useQuery(
    { days: 30 }
  );
  const { data: topProducts } =
    trpc.admin.analytics.topProducts.useQuery({ limit: 10 });
  const { data: inventory } =
    trpc.admin.analytics.inventory.useQuery();
  const { data: customers } = trpc.admin.customers.list.useQuery();
  const { data: coupons } = trpc.admin.coupons.list.useQuery({ active: true });
  const { data: orders } = trpc.admin.allOrders.useQuery();

  // Mutations
  const createCoupon = trpc.admin.coupons.create.useMutation({
    onSuccess: () => {
      toast.success("Coupon created");
      setCouponForm({ code: "", discountType: "percentage", discountValue: 10, maxUses: 100 });
      trpc.useUtils().admin.coupons.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteCoupon = trpc.admin.coupons.delete.useMutation({
    onSuccess: () => {
      toast.success("Coupon deleted");
      trpc.useUtils().admin.coupons.list.invalidate();
    },
  });

  const sendBroadcast = trpc.admin.email.sendBroadcast.useMutation({
    onSuccess: (data) => {
      toast.success(`Email sent to ${data.sent} users`);
      setEmailForm({ subject: "", message: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  // Format currency
  const formatCurrency = (value: any) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `KSh ${num?.toFixed(0) ?? 0}`;
  };

  // Low stock items
  const lowStockItems = useMemo(
    () => inventory?.filter((item) => item.stock < 10) ?? [],
    [inventory]
  );

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex gap-0 border-b border-[oklch(0.88_0.015_75)] mb-6 overflow-x-auto">
        {(
          [
            "analytics",
            "revenue",
            "products",
            "inventory",
            "customers",
            "coupons",
            "orders",
            "email",
          ] as DashboardTab[]
        ).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`font-sans text-xs tracking-[0.15em] uppercase px-4 py-3 border-b-2 -mb-px transition-all whitespace-nowrap ${
              tab === t
                ? "border-[oklch(0.38_0.07_55)] text-[oklch(0.38_0.07_55)]"
                : "border-transparent text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.18_0.015_60)]"
            }`}
          >
            {t === "analytics"
              ? "Sales"
              : t === "revenue"
                ? "Revenue"
                : t === "products"
                  ? "Performance"
                  : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Sales Analytics Tab */}
      {tab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[oklch(0.88_0.015_75)] p-6">
              <p className="font-sans text-xs text-[oklch(0.52_0.02_60)] mb-2">
                Total Revenue
              </p>
              <p className="font-serif text-2xl font-medium text-[oklch(0.38_0.07_55)]">
                {formatCurrency(analytics?.totalRevenue ?? 0)}
              </p>
            </div>
            <div className="bg-white border border-[oklch(0.88_0.015_75)] p-6">
              <p className="font-sans text-xs text-[oklch(0.52_0.02_60)] mb-2">
                Total Orders
              </p>
              <p className="font-serif text-2xl font-medium text-[oklch(0.18_0.015_60)]">
                {analytics?.totalOrders ?? 0}
              </p>
            </div>
            <div className="bg-white border border-[oklch(0.88_0.015_75)] p-6">
              <p className="font-sans text-xs text-[oklch(0.52_0.02_60)] mb-2">
                Average Order Value
              </p>
              <p className="font-serif text-2xl font-medium text-[oklch(0.52_0.02_60)]">
                {formatCurrency(analytics?.averageOrderValue ?? 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Report Tab */}
      {tab === "revenue" && (
        <div className="bg-white border border-[oklch(0.88_0.015_75)] p-6">
          <h3 className="font-serif text-lg mb-4 text-[oklch(0.18_0.015_60)]">
            Revenue Trend (Last 30 Days)
          </h3>
          {revenueData && revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="oklch(0.38 0.07 55)"
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-10 text-[oklch(0.52_0.02_60)]">
              No revenue data available
            </p>
          )}
        </div>
      )}

      {/* Product Performance Tab */}
      {tab === "products" && (
        <div className="bg-white border border-[oklch(0.88_0.015_75)] overflow-hidden">
          <div className="p-6 border-b border-[oklch(0.88_0.015_75)]">
            <h3 className="font-serif text-lg text-[oklch(0.18_0.015_60)]">
              Top Selling Products
            </h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[oklch(0.88_0.015_75)] bg-[oklch(0.96_0.012_80)]">
                {["Product", "Sold", "Revenue"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.52_0.02_60)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[oklch(0.88_0.015_75)]">
              {topProducts?.map((p) => (
                <tr key={p.productId} className="hover:bg-[oklch(0.98_0.005_80)]">
                  <td className="px-4 py-3 font-sans text-sm text-[oklch(0.18_0.015_60)]">
                    {p.productName}
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-[oklch(0.52_0.02_60)]">
                    {p.totalSold ?? 0} units
                  </td>
                  <td className="px-4 py-3 font-sans text-sm font-medium text-[oklch(0.38_0.07_55)]">
                    {formatCurrency(p.totalRevenue ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inventory Tab */}
      {tab === "inventory" && (
        <div className="space-y-6">
          {lowStockItems.length > 0 && (
            <div className="bg-red-50 border border-red-200 p-4 rounded flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-sans font-medium text-red-900 mb-1">
                  Low Stock Alert
                </p>
                <p className="font-sans text-sm text-red-700">
                  {lowStockItems.length} products have stock below 10 units
                </p>
              </div>
            </div>
          )}
          <div className="bg-white border border-[oklch(0.88_0.015_75)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[oklch(0.88_0.015_75)] bg-[oklch(0.96_0.012_80)]">
                  {["Product", "Stock", "Price", "Status"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.52_0.02_60)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[oklch(0.88_0.015_75)]">
                {inventory?.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[oklch(0.98_0.005_80)] transition-colors"
                  >
                    <td className="px-4 py-3 font-sans text-sm text-[oklch(0.18_0.015_60)]">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 font-sans text-sm font-medium text-[oklch(0.38_0.07_55)]">
                      {item.stock}
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-[oklch(0.52_0.02_60)]">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-sans text-[10px] px-2 py-1 rounded ${
                          item.stock < 10
                            ? "bg-red-100 text-red-700"
                            : item.stock < 30
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.stock < 10 ? "Low" : item.stock < 30 ? "Medium" : "Good"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {tab === "customers" && (
        <div className="bg-white border border-[oklch(0.88_0.015_75)] overflow-hidden">
          <div className="p-6 border-b border-[oklch(0.88_0.015_75)]">
            <h3 className="font-serif text-lg text-[oklch(0.18_0.015_60)]">
              Total Customers: {customers?.length ?? 0}
            </h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[oklch(0.88_0.015_75)] bg-[oklch(0.96_0.012_80)]">
                {["Name", "Email", "Orders", "Joined"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.52_0.02_60)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[oklch(0.88_0.015_75)]">
              {customers?.map((c) => (
                <tr key={c.id} className="hover:bg-[oklch(0.98_0.005_80)]">
                  <td className="px-4 py-3 font-sans text-sm text-[oklch(0.18_0.015_60)]">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-[oklch(0.52_0.02_60)]">
                    {c.email}
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-[oklch(0.38_0.07_55)]">
                    0
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-[oklch(0.52_0.02_60)]">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Coupons Tab */}
      {tab === "coupons" && (
        <div className="space-y-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-luxury flex items-center gap-2">
                <Plus size={16} /> Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Coupon</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block font-sans text-sm mb-2 text-[oklch(0.18_0.015_60)]">
                    Coupon Code
                  </label>
                  <Input
                    value={couponForm.code}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, code: e.target.value })
                    }
                    placeholder="e.g., SUMMER20"
                    className="font-sans"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm mb-2 text-[oklch(0.18_0.015_60)]">
                    Discount Value
                  </label>
                  <Input
                    type="number"
                    value={couponForm.discountValue}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        discountValue: parseInt(e.target.value),
                      })
                    }
                    className="font-sans"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm mb-2 text-[oklch(0.18_0.015_60)]">
                    Max Uses
                  </label>
                  <Input
                    type="number"
                    value={couponForm.maxUses}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        maxUses: parseInt(e.target.value),
                      })
                    }
                    className="font-sans"
                  />
                </div>
                <Button
                  onClick={() =>
                    createCoupon.mutate({
                      code: couponForm.code,
                      discountType: couponForm.discountType,
                      discountValue: couponForm.discountValue,
                      maxUses: couponForm.maxUses,
                    })
                  }
                  disabled={createCoupon.isPending || !couponForm.code}
                  className="w-full btn-luxury"
                >
                  {createCoupon.isPending ? "Creating..." : "Create Coupon"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="bg-white border border-[oklch(0.88_0.015_75)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[oklch(0.88_0.015_75)] bg-[oklch(0.96_0.012_80)]">
                  {["Code", "Discount", "Max Uses", "Used", "Active", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.52_0.02_60)]"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[oklch(0.88_0.015_75)]">
                {coupons?.map((c) => (
                  <tr key={c.id} className="hover:bg-[oklch(0.98_0.005_80)]">
                    <td className="px-4 py-3 font-sans text-sm font-medium text-[oklch(0.18_0.015_60)]">
                      {c.code}
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-[oklch(0.38_0.07_55)]">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : `KSh ${c.discountValue}`}
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-[oklch(0.52_0.02_60)]">
                      {c.maxUses ?? 'Unlimited'}
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-[oklch(0.52_0.02_60)]">
                      {c.currentUses ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-sans text-[10px] px-2 py-1 rounded ${
                          c.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          if (confirm(`Delete coupon ${c.code}?`)) {
                            deleteCoupon.mutate({ id: c.id });
                          }
                        }}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {tab === "orders" && (
        <div className="bg-white border border-[oklch(0.88_0.015_75)] overflow-hidden">
          <div className="p-6 border-b border-[oklch(0.88_0.015_75)]">
            <h3 className="font-serif text-lg text-[oklch(0.18_0.015_60)]">
              All Orders: {orders?.length ?? 0}
            </h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[oklch(0.88_0.015_75)] bg-[oklch(0.96_0.012_80)]">
                {["Order ID", "Customer", "Total", "Status", "Date"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.52_0.02_60)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[oklch(0.88_0.015_75)]">
              {orders?.map((o) => (
                <tr key={o.id} className="hover:bg-[oklch(0.98_0.005_80)]">
                  <td className="px-4 py-3 font-sans text-sm font-medium text-[oklch(0.38_0.07_55)]">
                    #{o.id}
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-[oklch(0.18_0.015_60)]">
                    {o.customerName}
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-[oklch(0.38_0.07_55)]">
                    {formatCurrency(o.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-sans text-[10px] px-2 py-1 rounded ${
                        o.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : o.status === "shipped"
                            ? "bg-blue-100 text-blue-700"
                            : o.status === "processing"
                              ? "bg-purple-100 text-purple-700"
                              : o.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-[oklch(0.52_0.02_60)]">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Email Marketing Tab */}
      {tab === "email" && (
        <div className="bg-white border border-[oklch(0.88_0.015_75)] p-6">
          <h3 className="font-serif text-lg mb-6 text-[oklch(0.18_0.015_60)]">
            Send Broadcast Email
          </h3>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block font-sans text-sm mb-2 text-[oklch(0.18_0.015_60)]">
                Subject
              </label>
              <Input
                value={emailForm.subject}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, subject: e.target.value })
                }
                placeholder="Email subject line"
                className="font-sans"
              />
            </div>
            <div>
              <label className="block font-sans text-sm mb-2 text-[oklch(0.18_0.015_60)]">
                Message
              </label>
              <Textarea
                value={emailForm.message}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, message: e.target.value })
                }
                placeholder="Email message body"
                rows={6}
                className="font-sans"
              />
            </div>
            <Button
              onClick={() =>
                sendBroadcast.mutate({
                  subject: emailForm.subject,
                  message: emailForm.message,
                })
              }
              disabled={
                sendBroadcast.isPending ||
                !emailForm.subject ||
                !emailForm.message
              }
              className="btn-luxury flex items-center gap-2"
            >
              <Send size={16} />
              {sendBroadcast.isPending ? "Sending..." : "Send to All Users"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
