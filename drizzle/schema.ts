import {
  boolean,
  decimal,
  integer,
  json,
  pgSchema,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

const utcTimestamp = (name: string) => timestamp(name, { withTimezone: true });
const omaLuxeSchema = pgSchema("omaluxe");

export const userRoleEnum = omaLuxeSchema.enum("user_role", ["user", "admin"]);
export const orderStatusEnum = omaLuxeSchema.enum("order_status", ["pending", "processing", "shipped", "delivered", "cancelled"]);
export const notificationTypeEnum = omaLuxeSchema.enum("notification_type", ["order_placed", "order_updated", "promotion", "new_arrival", "system"]);
export const discountTypeEnum = omaLuxeSchema.enum("discount_type", ["percentage", "fixed"]);

export const users = omaLuxeSchema.table("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: utcTimestamp("createdAt").defaultNow().notNull(),
  updatedAt: utcTimestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: utcTimestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const categories = omaLuxeSchema.table("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  description: text("description"),
  createdAt: utcTimestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;

export const products = omaLuxeSchema.table("products", {
  id: serial("id").primaryKey(),
  categoryId: integer("categoryId"),
  name: varchar("name", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  description: text("description"),
  scentNotes: text("scentNotes"),
  burnTime: varchar("burnTime", { length: 64 }),
  imageUrl: text("imageUrl"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  sizes: json("sizes").$type<{ label: string; price: number }[]>(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  isBestseller: boolean("isBestseller").default(false).notNull(),
  stock: integer("stock").default(100).notNull(),
  mood: varchar("mood", { length: 128 }),
  createdAt: utcTimestamp("createdAt").defaultNow().notNull(),
  updatedAt: utcTimestamp("updatedAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const cartItems = omaLuxeSchema.table("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  selectedSize: varchar("selectedSize", { length: 64 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: utcTimestamp("createdAt").defaultNow().notNull(),
  updatedAt: utcTimestamp("updatedAt").defaultNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;

export const orders = omaLuxeSchema.table("orders", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  customerName: varchar("customerName", { length: 256 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 32 }),
  shippingAddress: text("shippingAddress").notNull(),
  city: varchar("city", { length: 128 }),
  country: varchar("country", { length: 128 }),
  postalCode: varchar("postalCode", { length: 32 }),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).default("0").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  notes: text("notes"),
  createdAt: utcTimestamp("createdAt").defaultNow().notNull(),
  updatedAt: utcTimestamp("updatedAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;

export const orderItems = omaLuxeSchema.table("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId").notNull(),
  productName: varchar("productName", { length: 256 }).notNull(),
  selectedSize: varchar("selectedSize", { length: 64 }),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;

export const notifications = omaLuxeSchema.table("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  orderId: integer("orderId"),
  createdAt: utcTimestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export const notificationPreferences = omaLuxeSchema.table("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  orderUpdates: boolean("orderUpdates").default(true).notNull(),
  promotions: boolean("promotions").default(true).notNull(),
  newArrivals: boolean("newArrivals").default(true).notNull(),
  createdAt: utcTimestamp("createdAt").defaultNow().notNull(),
  updatedAt: utcTimestamp("updatedAt").defaultNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;

export const wishlistItems = omaLuxeSchema.table("wishlist_items", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  productId: integer("productId").notNull(),
  createdAt: utcTimestamp("createdAt").defaultNow().notNull(),
});

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = typeof wishlistItems.$inferInsert;

export const coupons = omaLuxeSchema.table("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  description: text("description"),
  discountType: discountTypeEnum("discountType").notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
  maxUses: integer("maxUses"),
  currentUses: integer("currentUses").default(0).notNull(),
  minOrderValue: decimal("minOrderValue", { precision: 10, scale: 2 }),
  expiresAt: utcTimestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: utcTimestamp("createdAt").defaultNow().notNull(),
  updatedAt: utcTimestamp("updatedAt").defaultNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

export const reviews = omaLuxeSchema.table("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull(),
  userId: integer("userId").notNull(),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 256 }),
  comment: text("comment"),
  helpful: integer("helpful").default(0).notNull(),
  createdAt: utcTimestamp("createdAt").defaultNow().notNull(),
  updatedAt: utcTimestamp("updatedAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
