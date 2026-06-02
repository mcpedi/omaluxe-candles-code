import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Package, ShoppingBag, Eye } from "lucide-react";
import ImageUploadField from "@/components/ImageUploadField";
import AdminDashboard from "@/components/AdminDashboard";
import { trpc } from "@/lib/trpc";

type AdminTab = "products" | "orders" | "dashboard";

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [tab, setTab] = useState<AdminTab>("dashboard");
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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Products", value: products?.length ?? 0, icon: "📦" },
            { label: "Total Orders", value: orders?.length ?? 0, icon: "🛍️" },
            { label: "Pending Orders", value: orders?.filter(o => o.status === "pending").length ?? 0, icon: "⏳" },
            { label: "Revenue", value: `KSh ${orders?.reduce((s, o) => s + parseFloat(o.total), 0).toFixed(0) ?? 0}`, icon: "💰" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-[oklch(0.88_0.015_75)] p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="font-serif text-2xl font-medium text-[oklch(0.18_0.015_60)]">{stat.value}</p>
              <p className="font-sans text-xs text-[oklch(0.52_0.02_60)] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[oklch(0.88_0.015_75)] mb-6 overflow-x-auto">
          {(["dashboard", "products", "orders"] as AdminTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-sans text-xs tracking-[0.15em] uppercase px-6 py-3 border-b-2 -mb-px transition-all whitespace-nowrap ${
                tab === t
                  ? "border-[oklch(0.38_0.07_55)] text-[oklch(0.38_0.07_55)]"
                  : "border-transparent text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.18_0.015_60)]"
              }`}
            >
              {t === "dashboard" ? "Dashboard" : t === "products" ? "Products" : "Orders"}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <AdminDashboard />
        )}

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
                        <td className="px-4 py-3 font-sans text-sm text-[oklch(0.38_0.07_55)]">KSh {parseFloat(p.price).toFixed(2)}</td>
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

            {/* Product Form Modal */}
            {showProductForm && (
              <ProductFormModal
                product={editingProduct}
                onClose={() => setShowProductForm(false)}
              />
            )}
          </div>
        )}

        {/* Orders Tab */}
        {tab === "orders" && (
          <div>
            <div className="mb-6">
              <p className="font-sans text-sm text-[oklch(0.52_0.02_60)]">{orders?.length ?? 0} orders</p>
            </div>

            {ordersLoading ? (
              <div className="text-center py-10">
                <div className="w-6 h-6 border-2 border-[oklch(0.72_0.12_75)] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white border border-[oklch(0.88_0.015_75)] overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[oklch(0.88_0.015_75)] bg-[oklch(0.96_0.012_80)]">
                          {["Order ID", "Customer", "Total", "Status", "Date"].map((h) => (
                            <th key={h} className="text-left px-4 py-3 font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.52_0.02_60)]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[oklch(0.88_0.015_75)]">
                        {orders?.map((o) => (
                          <tr
                            key={o.id}
                            onClick={() => setSelectedOrder(o.id)}
                            className="hover:bg-[oklch(0.98_0.005_80)] cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-3 font-sans text-sm font-medium text-[oklch(0.38_0.07_55)]">#{o.id}</td>
                            <td className="px-4 py-3 font-sans text-sm text-[oklch(0.18_0.015_60)]">{o.customerName}</td>
                            <td className="px-4 py-3 font-sans text-sm text-[oklch(0.38_0.07_55)]">KSh {parseFloat(o.total).toFixed(2)}</td>
                            <td className="px-4 py-3">
                              <span className={`font-sans text-[10px] px-2 py-1 rounded ${statusColors[o.status] || "bg-gray-100 text-gray-700"}`}>
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
                </div>

                {/* Order Detail Sidebar */}
                {selectedOrder && orderDetail && (
                  <div className="bg-white border border-[oklch(0.88_0.015_75)] p-6 h-fit sticky top-24">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif text-lg text-[oklch(0.18_0.015_60)]">Order #{selectedOrder}</h3>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.18_0.015_60)]"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="font-sans text-xs text-[oklch(0.52_0.02_60)] mb-1">Customer</p>
                        <p className="font-sans text-sm text-[oklch(0.18_0.015_60)]">{orderDetail.order.customerName}</p>
                        <p className="font-sans text-xs text-[oklch(0.52_0.02_60)]">{orderDetail.order.customerEmail}</p>
                      </div>

                      <div>
                        <p className="font-sans text-xs text-[oklch(0.52_0.02_60)] mb-1">Items</p>
                        <div className="space-y-2">
                          {orderDetail.items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-[oklch(0.18_0.015_60)]">{item.productName} x{item.quantity}</span>
                              <span className="text-[oklch(0.38_0.07_55)] font-medium">KSh {parseFloat(item.price).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-[oklch(0.88_0.015_75)] pt-4">
                        <div className="flex justify-between mb-3">
                          <span className="font-sans text-sm text-[oklch(0.52_0.02_60)]">Total</span>
                          <span className="font-serif text-lg font-medium text-[oklch(0.38_0.07_55)]">KSh {parseFloat(orderDetail.order.total).toFixed(2)}</span>
                        </div>

                        <div>
                          <label className="block font-sans text-xs text-[oklch(0.52_0.02_60)] mb-2">Update Status</label>
                          <select
                            value={orderDetail.order.status}
                            onChange={(e) => updateStatus.mutate({ id: selectedOrder, status: e.target.value as any })}
                            className="w-full px-3 py-2 border border-[oklch(0.88_0.015_75)] rounded font-sans text-sm"
                          >
                            {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Product Form Modal Component
function ProductFormModal({ product, onClose }: { product: any; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    stock: product?.stock || 100,
    isFeatured: product?.isFeatured || false,
    isBestseller: product?.isBestseller || false,
    imageUrl: product?.imageUrl || "",
  });

  const utils = trpc.useUtils();
  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      toast.success("Product created");
      onClose();
    },
  });

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      toast.success("Product updated");
      onClose();
    },
  });

  const handleSubmit = () => {
    const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    if (product?.id) {
      updateProduct.mutate({ id: product.id, ...formData, slug });
    } else {
      createProduct.mutate({ ...formData, slug });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[oklch(0.88_0.015_75)] p-6 flex justify-between items-center">
          <h2 className="font-serif text-2xl text-[oklch(0.18_0.015_60)]">
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button onClick={onClose} className="text-2xl text-[oklch(0.52_0.02_60)]">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block font-sans text-sm mb-2 text-[oklch(0.18_0.015_60)]">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-[oklch(0.88_0.015_75)] rounded font-sans"
            />
          </div>

          <div>
            <label className="block font-sans text-sm mb-2 text-[oklch(0.18_0.015_60)]">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-[oklch(0.88_0.015_75)] rounded font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-sm mb-2 text-[oklch(0.18_0.015_60)]">Price (KSh)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-[oklch(0.88_0.015_75)] rounded font-sans"
              />
            </div>
            <div>
              <label className="block font-sans text-sm mb-2 text-[oklch(0.18_0.015_60)]">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-[oklch(0.88_0.015_75)] rounded font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block font-sans text-sm mb-2 text-[oklch(0.18_0.015_60)]">Product Image</label>
            <ImageUploadField
              value={formData.imageUrl}
              onChange={(url: string) => setFormData({ ...formData, imageUrl: url })}
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="font-sans text-sm text-[oklch(0.18_0.015_60)]">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isBestseller}
                onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="font-sans text-sm text-[oklch(0.18_0.015_60)]">Bestseller</span>
            </label>
          </div>

          <div className="flex gap-4 pt-6 border-t border-[oklch(0.88_0.015_75)]">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[oklch(0.88_0.015_75)] rounded font-sans text-sm text-[oklch(0.52_0.02_60)] hover:bg-[oklch(0.96_0.012_80)]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={createProduct.isPending || updateProduct.isPending}
              className="flex-1 btn-luxury"
            >
              {createProduct.isPending || updateProduct.isPending ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
