import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// Mock db module
vi.mock("./db", () => ({
  getAllProducts: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "Velvet Rose & Oud",
      slug: "velvet-rose-oud",
      price: "48.00",
      isFeatured: true,
      isBestseller: true,
      stock: 100,
      mood: "romantic",
      description: "A deeply romantic blend",
      scentNotes: "Top: Bulgarian Rose",
      burnTime: "55–60 hours",
      imageUrl: null,
      sizes: [],
      categoryId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getFeaturedProducts: vi.fn().mockResolvedValue([]),
  getBestsellerProducts: vi.fn().mockResolvedValue([]),
  getProductBySlug: vi.fn().mockResolvedValue({
    id: 1,
    name: "Velvet Rose & Oud",
    slug: "velvet-rose-oud",
    price: "48.00",
    isFeatured: true,
    isBestseller: true,
    stock: 100,
    mood: "romantic",
    description: "A deeply romantic blend",
    scentNotes: "Top: Bulgarian Rose",
    burnTime: "55–60 hours",
    imageUrl: null,
    sizes: [],
    categoryId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getProductById: vi.fn().mockResolvedValue(null),
  createProduct: vi.fn().mockResolvedValue(undefined),
  updateProduct: vi.fn().mockResolvedValue(undefined),
  deleteProduct: vi.fn().mockResolvedValue(undefined),
  getCartItems: vi.fn().mockResolvedValue([]),
  addCartItem: vi.fn().mockResolvedValue(1),
  updateCartItem: vi.fn().mockResolvedValue(undefined),
  removeCartItem: vi.fn().mockResolvedValue(undefined),
  clearCart: vi.fn().mockResolvedValue(undefined),
  createOrder: vi.fn().mockResolvedValue(42),
  getOrdersByUser: vi.fn().mockResolvedValue([]),
  getOrderWithItems: vi.fn().mockResolvedValue(null),
  getAllOrders: vi.fn().mockResolvedValue([]),
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
  seedProducts: vi.fn().mockResolvedValue(undefined),
  createNotification: vi.fn().mockResolvedValue(undefined),
  getNotificationsForUser: vi.fn().mockResolvedValue([]),
  getUnreadCount: vi.fn().mockResolvedValue(0),
  markNotificationRead: vi.fn().mockResolvedValue(undefined),
  markAllNotificationsRead: vi.fn().mockResolvedValue(undefined),
  getNotificationPreferences: vi.fn().mockResolvedValue(null),
  upsertNotificationPreferences: vi.fn().mockResolvedValue(undefined),
  getAllUsersForBroadcast: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "I recommend Velvet Rose & Oud for a romantic evening." } }],
  }),
}));

function makeCtx(role: "user" | "admin" = "user"): TrpcContext {
  const clearedCookies: any[] = [];
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: (name: string, opts: any) => clearedCookies.push({ name, opts }) } as any,
  };
}

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

// ── Auth tests ─────────────────────────────────────────────────────────────────
describe("auth", () => {
  it("returns null user for unauthenticated context", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const user = await caller.auth.me();
    expect(user).toBeNull();
  });

  it("returns user for authenticated context", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const user = await caller.auth.me();
    expect(user?.name).toBe("Test User");
  });

  it("logout clears cookie and returns success", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});

// ── Products tests ─────────────────────────────────────────────────────────────
describe("products", () => {
  it("lists all products", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const products = await caller.products.list();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
    expect(products[0].name).toBe("Velvet Rose & Oud");
  });

  it("gets product by slug", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const product = await caller.products.bySlug({ slug: "velvet-rose-oud" });
    expect(product.slug).toBe("velvet-rose-oud");
    expect(product.price).toBe("48.00");
  });

  it("admin can create product", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    const result = await caller.products.create({
      name: "Test Candle",
      slug: "test-candle",
      price: "35.00",
    });
    expect(result.success).toBe(true);
  });

  it("non-admin cannot create product", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.products.create({ name: "Test", slug: "test", price: "35.00" })
    ).rejects.toThrow();
  });
});

// ── Cart tests ─────────────────────────────────────────────────────────────────
describe("cart", () => {
  it("returns empty cart for user", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const items = await caller.cart.get();
    expect(Array.isArray(items)).toBe(true);
  });

  it("adds item to cart", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.cart.add({
      productId: 1,
      quantity: 2,
      price: "48.00",
    });
    expect(result.success).toBe(true);
  });

  it("removes item from cart", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.cart.remove({ id: 1 });
    expect(result.success).toBe(true);
  });
});

// ── Orders tests ───────────────────────────────────────────────────────────────
describe("orders", () => {
  it("places an order and returns orderId", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.orders.place({
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      shippingAddress: "123 Luxury Lane",
      city: "London",
      country: "UK",
      items: [
        {
          productId: 1,
          productName: "Velvet Rose & Oud",
          quantity: 1,
          unitPrice: "48.00",
          subtotal: "48.00",
        },
      ],
      subtotal: "48.00",
      shipping: "9.99",
      total: "57.99",
    });
    expect(result.success).toBe(true);
    expect(result.orderId).toBe(42);
  });

  it("returns empty order history for user", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const orders = await caller.orders.myOrders();
    expect(Array.isArray(orders)).toBe(true);
  });
});

// ── AI tests ───────────────────────────────────────────────────────────────────
describe("ai.recommend", () => {
  it("returns a recommendation from the AI", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.ai.recommend({
      messages: [{ role: "user", content: "I want something romantic" }],
    });
    expect(typeof result.content).toBe("string");
    expect(result.content.length).toBeGreaterThan(0);
  });
});
