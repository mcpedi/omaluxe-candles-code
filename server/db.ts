import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, cartItems, categories, orderItems, orders, products, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ── Products ──────────────────────────────────────────────────────────────────
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function getFeaturedProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.isFeatured, true)).limit(6);
}

export async function getBestsellerProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.isBestseller, true)).limit(6);
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0];
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function createProduct(data: typeof products.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(products).values(data);
}

export async function updateProduct(id: number, data: Partial<typeof products.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(products).where(eq(products.id, id));
}

// ── Categories ────────────────────────────────────────────────────────────────
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories);
}

// ── Cart ──────────────────────────────────────────────────────────────────────
export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cartItems).where(eq(cartItems.userId, userId));
}

export async function addCartItem(data: typeof cartItems.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  // Check if same product+size already in cart
  const existing = await db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.userId, data.userId),
        eq(cartItems.productId, data.productId),
        data.selectedSize ? eq(cartItems.selectedSize, data.selectedSize) : eq(cartItems.selectedSize, "")
      )
    )
    .limit(1);
  if (existing[0]) {
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + (data.quantity ?? 1) })
      .where(eq(cartItems.id, existing[0].id));
    return existing[0].id;
  }
  const result = await db.insert(cartItems).values(data);
  return (result[0] as any).insertId;
}

export async function updateCartItem(id: number, userId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(cartItems).set({ quantity }).where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)));
}

export async function removeCartItem(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(cartItems).where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ── Orders ────────────────────────────────────────────────────────────────────
export async function createOrder(
  orderData: typeof orders.$inferInsert,
  items: typeof orderItems.$inferInsert[]
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(orders).values(orderData);
  const orderId = (result[0] as any).insertId;
  const itemsWithOrderId = items.map((item) => ({ ...item, orderId }));
  await db.insert(orderItems).values(itemsWithOrderId);
  return orderId;
}

export async function getOrdersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getOrderWithItems(orderId: number) {
  const db = await getDb();
  if (!db) return null;
  const orderResult = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!orderResult[0]) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  return { order: orderResult[0], items };
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(orderId: number, status: "pending" | "processing" | "shipped" | "delivered" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(orders).set({ status }).where(eq(orders.id, orderId));
}

// ── Seed ──────────────────────────────────────────────────────────────────────
export async function seedProducts() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(products).limit(1);
  if (existing.length > 0) return; // already seeded

  const catResult = await db.insert(categories).values([
    { name: "Scented Candles", slug: "scented-candles", description: "Premium scented candles for every mood" },
    { name: "Pillar Candles", slug: "pillar-candles", description: "Elegant pillar candles for home décor" },
    { name: "Gift Sets", slug: "gift-sets", description: "Curated candle gift collections" },
  ]);

  const productData: typeof products.$inferInsert[] = [
    {
      name: "Velvet Rose & Oud",
      slug: "velvet-rose-oud",
      categoryId: 1,
      description: "A deeply romantic blend of Bulgarian rose petals and smoky oud wood, wrapped in warm amber. Perfect for intimate evenings.",
      scentNotes: "Top: Bulgarian Rose, Bergamot | Heart: Oud Wood, Sandalwood | Base: Amber, Musk",
      burnTime: "55–60 hours",
      imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663535558553/KyKey2VrFEZNwKpbpdN6tN/candle-7_2da19a79.jpg",
      price: "48.00",
      sizes: [{ label: "Small (150g)", price: 28 }, { label: "Medium (250g)", price: 48 }, { label: "Large (400g)", price: 68 }],
      isFeatured: true,
      isBestseller: true,
      mood: "romantic",
    },
    {
      name: "Midnight Jasmine",
      slug: "midnight-jasmine",
      categoryId: 1,
      description: "An intoxicating floral bouquet of night-blooming jasmine and white lily, grounded in creamy sandalwood.",
      scentNotes: "Top: Jasmine, White Lily | Heart: Ylang Ylang, Neroli | Base: Sandalwood, Vanilla",
      burnTime: "50–55 hours",
      imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663535558553/KyKey2VrFEZNwKpbpdN6tN/candle-1_0893b0e3.jpg",
      price: "42.00",
      sizes: [{ label: "Small (150g)", price: 24 }, { label: "Medium (250g)", price: 42 }, { label: "Large (400g)", price: 62 }],
      isFeatured: true,
      isBestseller: false,
      mood: "romantic",
    },
    {
      name: "Cedarwood & Sage",
      slug: "cedarwood-sage",
      categoryId: 1,
      description: "A grounding, earthy blend of aged cedarwood and fresh sage, evoking the calm of a forest retreat.",
      scentNotes: "Top: Sage, Eucalyptus | Heart: Cedarwood, Pine | Base: Vetiver, Patchouli",
      burnTime: "60–65 hours",
      imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663535558553/KyKey2VrFEZNwKpbpdN6tN/candle-4_403d6beb.jpg",
      price: "44.00",
      sizes: [{ label: "Small (150g)", price: 26 }, { label: "Medium (250g)", price: 44 }, { label: "Large (400g)", price: 64 }],
      isFeatured: true,
      isBestseller: true,
      mood: "calm",
    },
    {
      name: "Citrus Bloom",
      slug: "citrus-bloom",
      categoryId: 1,
      description: "A bright, uplifting burst of Sicilian lemon, grapefruit, and fresh orange blossom to energise your space.",
      scentNotes: "Top: Lemon, Grapefruit | Heart: Orange Blossom, Peach | Base: White Musk, Cedarwood",
      burnTime: "45–50 hours",
      imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663535558553/KyKey2VrFEZNwKpbpdN6tN/candle-8_a981bc9b.jpg",
      price: "38.00",
      sizes: [{ label: "Small (150g)", price: 22 }, { label: "Medium (250g)", price: 38 }, { label: "Large (400g)", price: 58 }],
      isFeatured: false,
      isBestseller: true,
      mood: "energising",
    },
    {
      name: "Warm Vanilla & Amber",
      slug: "warm-vanilla-amber",
      categoryId: 1,
      description: "A comforting, gourmand blend of Madagascar vanilla bean and golden amber resin — like a warm embrace.",
      scentNotes: "Top: Vanilla Bean, Caramel | Heart: Amber, Tonka Bean | Base: Musk, Benzoin",
      burnTime: "55–60 hours",
      imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663535558553/KyKey2VrFEZNwKpbpdN6tN/candle-3_c4b79e22.jpg",
      price: "46.00",
      sizes: [{ label: "Small (150g)", price: 27 }, { label: "Medium (250g)", price: 46 }, { label: "Large (400g)", price: 66 }],
      isFeatured: true,
      isBestseller: true,
      mood: "cosy",
    },
    {
      name: "Himalayan Mist",
      slug: "himalayan-mist",
      categoryId: 1,
      description: "A serene, meditative blend of cool mountain air, white tea, and soft iris — designed for mindful moments.",
      scentNotes: "Top: White Tea, Bergamot | Heart: Iris, Violet | Base: Driftwood, Musk",
      burnTime: "50–55 hours",
      imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663535558553/KyKey2VrFEZNwKpbpdN6tN/candle-5_a297d52f.jpg",
      price: "44.00",
      sizes: [{ label: "Small (150g)", price: 26 }, { label: "Medium (250g)", price: 44 }, { label: "Large (400g)", price: 64 }],
      isFeatured: false,
      isBestseller: false,
      mood: "calm",
    },
    {
      name: "Black Orchid",
      slug: "black-orchid",
      categoryId: 1,
      description: "A mysterious, opulent fragrance of dark orchid and black truffle, underscored by rich patchouli.",
      scentNotes: "Top: Black Orchid, Bergamot | Heart: Dark Truffle, Ylang | Base: Patchouli, Amber",
      burnTime: "55–60 hours",
      imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663535558553/KyKey2VrFEZNwKpbpdN6tN/candle-2_8135761e.jpg",
      price: "52.00",
      sizes: [{ label: "Small (150g)", price: 30 }, { label: "Medium (250g)", price: 52 }, { label: "Large (400g)", price: 72 }],
      isFeatured: true,
      isBestseller: false,
      mood: "mysterious",
    },
    {
      name: "Amber Marble Pillar",
      slug: "amber-marble-pillar",
      categoryId: 2,
      description: "A sculptural amber glass pillar candle with a gold lid — a statement piece for any interior.",
      scentNotes: "Top: Amber Resin | Heart: Sandalwood | Base: Musk",
      burnTime: "70–80 hours",
      imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663535558553/KyKey2VrFEZNwKpbpdN6tN/candle-6_66d6d8ba.webp",
      price: "65.00",
      sizes: [{ label: "Standard (500g)", price: 65 }, { label: "Grande (800g)", price: 95 }],
      isFeatured: false,
      isBestseller: false,
      mood: "cosy",
    },
    {
      name: "The OmaLuxe Signature Set",
      slug: "omaluxe-signature-set",
      categoryId: 3,
      description: "Our most beloved trio — Velvet Rose & Oud, Midnight Jasmine, and Warm Vanilla & Amber — presented in a luxury gift box.",
      scentNotes: "A curated collection of three bestselling fragrances",
      burnTime: "45–60 hours each",
      imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663535558553/KyKey2VrFEZNwKpbpdN6tN/candle-9_72611a64.jpg",
      price: "120.00",
      sizes: [{ label: "Trio Gift Set", price: 120 }],
      isFeatured: true,
      isBestseller: true,
      mood: "romantic",
    },
  ];

  await db.insert(products).values(productData);
}
