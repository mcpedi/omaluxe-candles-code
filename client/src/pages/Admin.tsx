import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Package, ShoppingBag, Eye, X, Check } from "lucide-react";

type AdminTab = "products" | "orders";

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [tab, setTab] = useState<AdminTab>("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery();
  const { data: orders, isLoading: ordersLoading } = trpc.admin.allOrders.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });
  const { data: orderDetail } = trpc.admin.orderDetail.useQuery(
    { id: selectedOrder! },
    { enabled: !!selectedOrder }
  );

  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      toast.success("Product deleted");
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const updateStatus = trpc.admin.updateOrderStatus.useMutation({
    onSuccess: () => {
      utils.admin.allOrders.invalidate();
      toast.success("Order status updated");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[oklch(0.72_0.12_75)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl text-[oklch(0.52_0.02_60)] mb-4">Access Denied</p>
          <p className="font-sans text-sm text-[oklch(0.62_0.02_60)] mb-6">Admin access required.</p>
          <Link href="/"><button className="btn-luxury">Go Home</button></Link>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen pt-20 bg-[oklch(0.97_0.006_80)]">
      <div className="container py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-[oklch(0.62_0.12_70)] mb-1">Management</p>
          <h1 className="font-serif text-3xl font-light text-[oklch(0.18_0.015_60)]">Admin Panel</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Products", value: products?.length ?? 0, icon: <Package size={18} strokeWidth={1.5} /> },
            { label: "Total Orders", value: orders?.length ?? 0, icon: <ShoppingBag size={18} strokeWidth={1.5} /> },
            { label: "Pending Orders", value: orders?.filter(o => o.status === "pending").length ?? 0, icon: <Eye size={18} strokeWidth={1.5} /> },
            { label: "Revenue", value: `$${orders?.reduce((s, o) => s + parseFloat(o.total), 0).toFixed(0) ?? 0}`, icon: <Check size={18} strokeWidth={1.5} /> },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-[oklch(0.88_0.015_75)] p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[oklch(0.62_0.12_70)]">{stat.icon}</span>
              </div>
              <p className="font-serif text-2xl font-medium text-[oklch(0.18_0.015_60)]">{stat.value}</p>
              <p className="font-sans text-xs text-[oklch(0.52_0.02_60)] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[oklch(0.88_0.015_75)] mb-6">
          {(["products", "orders"] as AdminTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-sans text-xs tracking-[0.15em] uppercase px-6 py-3 border-b-2 -mb-px transition-all ${
                tab === t
                  ? "border-[oklch(0.38_0.07_55)] text-[oklch(0.38_0.07_55)]"
                  : "border-transparent text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.18_0.015_60)]"
              }`}
            >
              {t === "products" ? "Products" : "Orders"}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {tab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <p className="font-sans text-sm text-[oklch(0.52_0.02_60)]">{products?.length ?? 0} products</p>
              <button
                onClick={() => { setEditingProduct(null); setShowProductForm(true); }}
                className="btn-luxury flex items-center gap-2 py-2 px-4 text-xs"
              >
                <Plus size={14} /> Add Product
              </button>
            </div>

            {productsLoading ? (
              <div className="text-center py-10">
                <div className="w-6 h-6 border-2 border-[oklch(0.72_0.12_75)] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <div className="bg-white border border-[oklch(0.88_0.015_75)] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[oklch(0.88_0.015_75)] bg-[oklch(0.96_0.012_80)]">
                      {["Product", "Price", "Stock", "Featured", "Bestseller", "Actions"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.52_0.02_60)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[oklch(0.88_0.015_75)]">
                    {products?.map((p) => (
                      <tr key={p.id} className="hover:bg-[oklch(0.98_0.005_80)] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {p.imageUrl && (
                              <img src={p.imageUrl} alt={p.name} className="w-10 h-12 object-cover shrink-0" />
                            )}
                            <div>
                              <p className="font-sans text-sm font-medium text-[oklch(0.18_0.015_60)]">{p.name}</p>
                              <p className="font-sans text-xs text-[oklch(0.52_0.02_60)]">{p.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-sans text-sm text-[oklch(0.38_0.07_55)]">${parseFloat(p.price).toFixed(2)}</td>
                        <td className="px-4 py-3 font-sans text-sm text-[oklch(0.38_0.04_60)]">{p.stock}</td>
                        <td className="px-4 py-3">
                          <span className={`font-sans text-[10px] px-2 py-1 ${p.isFeatured ? "bg-[oklch(0.72_0.12_75/0.15)] text-[oklch(0.42_0.1_65)]" : "text-[oklch(0.62_0.02_60)]"}`}>
                            {p.isFeatured ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-sans text-[10px] px-2 py-1 ${p.isBestseller ? "bg-[oklch(0.38_0.07_55/0.1)] text-[oklch(0.38_0.07_55)]" : "text-[oklch(0.62_0.02_60)]"}`}>
                            {p.isBestseller ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link href={`/product/${p.slug}`}>
                              <button className="p-1.5 text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.38_0.07_55)] transition-colors">
                                <Eye size={14} />
                              </button>
                            </Link>
                            <button
                              onClick={() => { setEditingProduct(p); setShowProductForm(true); }}
                              className="p-1.5 text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.38_0.07_55)] transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${p.name}"?`)) deleteProduct.mutate({ id: p.id });
                              }}
                              className="p-1.5 text-[oklch(0.52_0.02_60)] hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {tab === "orders" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <p className="font-sans text-sm text-[oklch(0.52_0.02_60)] mb-4">{orders?.length ?? 0} orders</p>
              {ordersLoading ? (
                <div className="text-center py-10">
                  <div className="w-6 h-6 border-2 border-[oklch(0.72_0.12_75)] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : (
                <div className="bg-white border border-[oklch(0.88_0.015_75)] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[oklch(0.88_0.015_75)] bg-[oklch(0.96_0.012_80)]">
                        {["Order", "Customer", "Total", "Status", "Date", ""].map((h) => (
                          <th key={h} className="text-left px-4 py-3 font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.52_0.02_60)]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[oklch(0.88_0.015_75)]">
                      {orders?.map((order) => (
                        <tr
                          key={order.id}
                          className={`hover:bg-[oklch(0.98_0.005_80)] transition-colors cursor-pointer ${selectedOrder === order.id ? "bg-[oklch(0.96_0.012_80)]" : ""}`}
                          onClick={() => setSelectedOrder(order.id)}
                        >
                          <td className="px-4 py-3 font-sans text-sm font-medium text-[oklch(0.38_0.07_55)">#{order.id}</td>
                          <td className="px-4 py-3">
                            <p className="font-sans text-sm text-[oklch(0.18_0.015_60)]">{order.customerName}</p>
                            <p className="font-sans text-xs text-[oklch(0.52_0.02_60)]">{order.customerEmail}</p>
                          </td>
                          <td className="px-4 py-3 font-sans text-sm text-[oklch(0.38_0.07_55)]">${parseFloat(order.total).toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <span className={`font-sans text-[10px] px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-sans text-xs text-[oklch(0.52_0.02_60)]">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <Eye size={14} className="text-[oklch(0.62_0.12_70)]" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders?.length === 0 && (
                    <div className="text-center py-10">
                      <p className="font-sans text-sm text-[oklch(0.52_0.02_60)]">No orders yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Detail Panel */}
            {selectedOrder && orderDetail && (
              <div className="bg-white border border-[oklch(0.88_0.015_75)] p-5 h-fit sticky top-24">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-serif text-lg font-medium text-[oklch(0.18_0.015_60)]">Order #{selectedOrder}</h3>
                  <button onClick={() => setSelectedOrder(null)} className="text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.18_0.015_60)]">
                    <X size={16} />
                  </button>
                </div>
                {/* Customer */}
                <div className="mb-4 pb-4 border-b border-[oklch(0.88_0.015_75)]">
                  <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.62_0.12_70)] mb-2">Customer</p>
                  <p className="font-sans text-sm font-medium text-[oklch(0.18_0.015_60)]">{orderDetail.order.customerName}</p>
                  <p className="font-sans text-xs text-[oklch(0.52_0.02_60)]">{orderDetail.order.customerEmail}</p>
                  {orderDetail.order.customerPhone && (
                    <p className="font-sans text-xs text-[oklch(0.52_0.02_60)]">{orderDetail.order.customerPhone}</p>
                  )}
                  <p className="font-sans text-xs text-[oklch(0.52_0.02_60)] mt-1">
                    {orderDetail.order.shippingAddress}{orderDetail.order.city ? `, ${orderDetail.order.city}` : ""}
                    {orderDetail.order.country ? `, ${orderDetail.order.country}` : ""}
                  </p>
                </div>
                {/* Items */}
                <div className="mb-4 pb-4 border-b border-[oklch(0.88_0.015_75)]">
                  <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.62_0.12_70)] mb-2">Items</p>
                  <div className="space-y-2">
                    {orderDetail.items.map((item) => (
                      <div key={item.id} className="flex justify-between font-sans text-xs">
                        <span className="text-[oklch(0.38_0.04_60)]">{item.productName} ×{item.quantity}</span>
                        <span className="text-[oklch(0.38_0.07_55)]">${parseFloat(item.subtotal).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-[oklch(0.88_0.015_75)] flex justify-between font-sans text-sm font-medium">
                    <span>Total</span>
                    <span className="text-[oklch(0.38_0.07_55)]">${parseFloat(orderDetail.order.total).toFixed(2)}</span>
                  </div>
                </div>
                {/* Status update */}
                <div>
                  <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.62_0.12_70)] mb-2">Update Status</p>
                  <select
                    value={orderDetail.order.status}
                    onChange={(e) => updateStatus.mutate({ id: selectedOrder, status: e.target.value as any })}
                    className="w-full border border-[oklch(0.88_0.015_75)] px-3 py-2 font-sans text-sm text-[oklch(0.18_0.015_60)] focus:outline-none focus:border-[oklch(0.62_0.12_70)] bg-white"
                  >
                    {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => { setShowProductForm(false); setEditingProduct(null); }}
          onSuccess={() => {
            utils.products.list.invalidate();
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}

function ProductFormModal({ product, onClose, onSuccess }: { product: any; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    scentNotes: product?.scentNotes ?? "",
    burnTime: product?.burnTime ?? "",
    imageUrl: product?.imageUrl ?? "",
    price: product?.price ?? "",
    mood: product?.mood ?? "",
    isFeatured: product?.isFeatured ?? false,
    isBestseller: product?.isBestseller ?? false,
    stock: product?.stock ?? 100,
  });

  const createProduct = trpc.products.create.useMutation({ onSuccess });
  const updateProduct = trpc.products.update.useMutation({ onSuccess });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product) {
      updateProduct.mutate({ id: product.id, ...form, stock: Number(form.stock) });
    } else {
      createProduct.mutate({ ...form, stock: Number(form.stock) });
    }
  };

  const inputClass = "w-full bg-white border border-[oklch(0.88_0.015_75)] px-3 py-2.5 font-sans text-sm text-[oklch(0.18_0.015_60)] focus:outline-none focus:border-[oklch(0.62_0.12_70)] transition-colors";
  const labelClass = "font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.52_0.02_60)] block mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-[oklch(0.88_0.015_75)]">
          <h2 className="font-serif text-xl font-medium text-[oklch(0.18_0.015_60)]">
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button onClick={onClose} className="text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.18_0.015_60)]">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Slug *</label>
              <input type="text" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className={labelClass}>Scent Notes</label>
            <input type="text" value={form.scentNotes} onChange={(e) => setForm({ ...form, scentNotes: e.target.value })} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Price ($) *</label>
              <input type="text" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Burn Time</label>
              <input type="text" value={form.burnTime} onChange={(e) => setForm({ ...form, burnTime: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Image URL</label>
            <input type="text" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Mood</label>
              <input type="text" value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })} className={inputClass} placeholder="e.g. romantic" />
            </div>
            <div>
              <label className={labelClass}>Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) })} className={inputClass} />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4" />
              <span className="font-sans text-sm text-[oklch(0.38_0.04_60)]">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isBestseller} onChange={(e) => setForm({ ...form, isBestseller: e.target.checked })} className="w-4 h-4" />
              <span className="font-sans text-sm text-[oklch(0.38_0.04_60)]">Bestseller</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-luxury-outline flex-1">Cancel</button>
            <button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="btn-luxury flex-1">
              {createProduct.isPending || updateProduct.isPending ? "Saving..." : product ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
