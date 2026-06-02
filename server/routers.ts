import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import {
  addCartItem,
  clearCart,
  createOrder,
  createProduct,
  deleteProduct,
  getAllOrders,
  getAllProducts,
  getAllUsersForBroadcast,
  getBestsellerProducts,
  getCartItems,
  getFeaturedProducts,
  getNotificationPreferences,
  getNotificationsForUser,
  getOrderWithItems,
  getOrdersByUser,
  getProductById,
  getProductBySlug,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  createNotification,
  removeCartItem,
  seedProducts,
  updateCartItem,
  updateOrderStatus,
  updateProduct,
  upsertNotificationPreferences,
  addToWishlist,
  removeFromWishlist,
  getWishlistItems,
  isProductWishlisted,
  getWishlistCount,
  getSalesAnalytics,
  getRevenueByDate,
  getTopProducts,
  getInventoryStatus,
  getCustomerMetrics,
  createCoupon,
  getCoupons,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
  incrementCouponUses,
  getAllCustomers,
  getCustomerOrderHistory,
  getEmailListForMarketing,
} from "./db";
import { inArray } from "drizzle-orm";
import { notifications, users } from "../drizzle/schema";
import type { InsertNotification } from "../drizzle/schema";
import { getDb } from "./db";

// Admin guard middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Products ────────────────────────────────────────────────────────────────
  products: router({
    list: publicProcedure.query(async () => {
      await seedProducts();
      return getAllProducts();
    }),
    featured: publicProcedure.query(async () => {
      await seedProducts();
      return getFeaturedProducts();
    }),
    bestsellers: publicProcedure.query(async () => {
      await seedProducts();
      return getBestsellerProducts();
    }),
    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      const product = await getProductBySlug(input.slug);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      return product;
    }),
    byId: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const product = await getProductById(input.id);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      return product;
    }),
    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          slug: z.string().min(1),
          categoryId: z.number().optional(),
          description: z.string().optional(),
          scentNotes: z.string().optional(),
          burnTime: z.string().optional(),
          imageUrl: z.string().optional(),
          price: z.string(),
          sizes: z.array(z.object({ label: z.string(), price: z.number() })).optional(),
          isFeatured: z.boolean().optional(),
          isBestseller: z.boolean().optional(),
          stock: z.number().optional(),
          mood: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await createProduct(input as any);
        return { success: true };
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          slug: z.string().optional(),
          categoryId: z.number().optional(),
          description: z.string().optional(),
          scentNotes: z.string().optional(),
          burnTime: z.string().optional(),
          imageUrl: z.string().optional(),
          price: z.string().optional(),
          sizes: z.array(z.object({ label: z.string(), price: z.number() })).optional(),
          isFeatured: z.boolean().optional(),
          isBestseller: z.boolean().optional(),
          stock: z.number().optional(),
          mood: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateProduct(id, data as any);
        return { success: true };
      }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteProduct(input.id);
      return { success: true };
    }),
    uploadImage: adminProcedure
      .input(
        z.object({
          imageData: z.string(), // base64 encoded image
          fileName: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Convert base64 to buffer
          const buffer = Buffer.from(input.imageData.split(',')[1] || input.imageData, 'base64');
          
          // Determine MIME type from file extension
          const ext = input.fileName.split('.').pop()?.toLowerCase() || 'jpg';
          const mimeTypeMap: Record<string, string> = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml',
          };
          const mimeType = mimeTypeMap[ext] || 'image/jpeg';
          
          // Generate unique filename
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(7);
          const key = `products/${timestamp}-${randomSuffix}.${ext}`;
          
          // Upload to S3
          const { url } = await storagePut(key, buffer, mimeType);
          
          return { url };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to upload image'
          });
        }
      }),
  }),

  // ── Cart ────────────────────────────────────────────────────────────────────
  cart: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const items = await getCartItems(ctx.user.id);
      // Enrich with product info
      const enriched = await Promise.all(
        items.map(async (item) => {
          const product = await getProductById(item.productId);
          return { ...item, product };
        })
      );
      return enriched;
    }),
    add: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          quantity: z.number().min(1).default(1),
          selectedSize: z.string().optional(),
          price: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await addCartItem({
          userId: ctx.user.id,
          productId: input.productId,
          quantity: input.quantity,
          selectedSize: input.selectedSize ?? null,
          price: input.price,
        });
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number(), quantity: z.number().min(1) }))
      .mutation(async ({ ctx, input }) => {
        await updateCartItem(input.id, ctx.user.id, input.quantity);
        return { success: true };
      }),
    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await removeCartItem(input.id, ctx.user.id);
        return { success: true };
      }),
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  // ── Orders ──────────────────────────────────────────────────────────────────
  orders: router({
    place: protectedProcedure
      .input(
        z.object({
          customerName: z.string().min(1),
          customerEmail: z.string().email(),
          customerPhone: z.string().optional(),
          shippingAddress: z.string().min(1),
          city: z.string().optional(),
          country: z.string().optional(),
          postalCode: z.string().optional(),
          notes: z.string().optional(),
          items: z.array(
            z.object({
              productId: z.number(),
              productName: z.string(),
              selectedSize: z.string().optional(),
              quantity: z.number().min(1),
              unitPrice: z.string(),
              subtotal: z.string(),
            })
          ),
          subtotal: z.string(),
          shipping: z.string().default("0"),
          total: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { items, ...orderData } = input;
        const orderId = await createOrder(
          { ...orderData, userId: ctx.user.id, shipping: orderData.shipping ?? "0" },
          items.map((i) => ({ ...i, orderId: 0, selectedSize: i.selectedSize ?? null }))
        );

        // Clear cart after successful order
        await clearCart(ctx.user.id);

        // Notify owner
        const itemsList = items
          .map((i) => `• ${i.productName}${i.selectedSize ? ` (${i.selectedSize})` : ""} x${i.quantity} — $${i.subtotal}`)
          .join("\n");

        await notifyOwner({
          title: `🕯️ New Order #${orderId} — $${input.total}`,
          content: `**New order placed on OmaLuxe Candles and Scents!**\n\n**Customer:** ${input.customerName}\n**Email:** ${input.customerEmail}\n**Phone:** ${input.customerPhone || "N/A"}\n**Shipping Address:** ${input.shippingAddress}, ${input.city || ""}, ${input.country || ""} ${input.postalCode || ""}\n\n**Order Items:**\n${itemsList}\n\n**Subtotal:** $${input.subtotal}\n**Shipping:** $${input.shipping}\n**Total: $${input.total}**\n\n**Order Notes:** ${input.notes || "None"}\n\nOrder ID: #${orderId}`,
        });

        // Create in-app notification for customer
        await createNotification({
          userId: ctx.user.id,
          type: "order_placed",
          title: `Order #${orderId} Confirmed!`,
          message: `Thank you, ${input.customerName}! Your order of ${items.length} item${items.length > 1 ? "s" : ""} totalling $${input.total} has been placed successfully. We'll begin preparing your candles right away.`,
          orderId,
        });

        return { success: true, orderId };
      }),
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      return getOrdersByUser(ctx.user.id);
    }),
    detail: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const result = await getOrderWithItems(input.id);
      if (!result) throw new TRPCError({ code: "NOT_FOUND" });
      if (result.order.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return result;
    }),
  }),

  // ── Admin ───────────────────────────────────────────────────────────────────
  admin: router({
    allOrders: adminProcedure.query(async () => {
      return getAllOrders();
    }),
    orderDetail: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const result = await getOrderWithItems(input.id);
      if (!result) throw new TRPCError({ code: "NOT_FOUND" });
      return result;
    }),
    updateOrderStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateOrderStatus(input.id, input.status);
        // Notify the customer about status change
        const orderData = await getOrderWithItems(input.id);
        if (orderData) {
          const statusMessages: Record<string, string> = {
            processing: "Your order is now being processed and your candles are being prepared with care.",
            shipped: "Great news! Your OmaLuxe order is on its way. Expect delivery within 3–5 business days.",
            delivered: "Your OmaLuxe order has been delivered. We hope you love every scent!",
            cancelled: "Your order has been cancelled. If you have questions, please contact us.",
            pending: "Your order is pending confirmation.",
          };
          const statusLabels: Record<string, string> = {
            processing: "Order Being Processed",
            shipped: "Order Shipped!",
            delivered: "Order Delivered!",
            cancelled: "Order Cancelled",
            pending: "Order Pending",
          };
          await createNotification({
            userId: orderData.order.userId,
            type: "order_updated",
            title: statusLabels[input.status] ?? `Order #${input.id} Updated`,
            message: statusMessages[input.status] ?? `Your order status has been updated to ${input.status}.`,
            orderId: input.id,
          });
        }
        return { success: true };
      }),
    // ── Analytics ────────────────────────────────────────────────────────────────
    analytics: router({
      sales: adminProcedure.query(async () => {
        return await getSalesAnalytics();
      }),
      revenueByDate: adminProcedure
        .input(z.object({ days: z.number().default(30) }))
        .query(async ({ input }) => {
          return await getRevenueByDate(input.days);
        }),
      topProducts: adminProcedure
        .input(z.object({ limit: z.number().default(10) }))
        .query(async ({ input }) => {
          return await getTopProducts(input.limit);
        }),
      inventory: adminProcedure.query(async () => {
          return await getInventoryStatus();
        }),
      customerMetrics: adminProcedure.query(async () => {
          return await getCustomerMetrics();
        }),
    }),
    // ── Coupons ──────────────────────────────────────────────────────────────────
    coupons: router({
      list: adminProcedure
        .input(z.object({ active: z.boolean().default(true) }))
        .query(async ({ input }) => {
          return await getCoupons(input.active);
        }),
      create: adminProcedure
        .input(
          z.object({
            code: z.string(),
            description: z.string().optional(),
            discountType: z.enum(["percentage", "fixed"]),
            discountValue: z.number(),
            maxUses: z.number().optional(),
            minOrderValue: z.number().optional(),
            expiresAt: z.date().optional(),
          })
        )
        .mutation(async ({ input }) => {
          await createCoupon({
            code: input.code,
            description: input.description,
            discountType: input.discountType,
            discountValue: input.discountValue.toString(),
            maxUses: input.maxUses,
            minOrderValue: input.minOrderValue?.toString(),
            expiresAt: input.expiresAt,
          });
          return { success: true };
        }),
      update: adminProcedure
        .input(
          z.object({
            id: z.number(),
            updates: z.object({
              description: z.string().optional(),
              discountValue: z.number().optional(),
              maxUses: z.number().optional(),
              isActive: z.boolean().optional(),
            }),
          })
        )
        .mutation(async ({ input }) => {
          await updateCoupon(input.id, {
            description: input.updates.description,
            discountValue: input.updates.discountValue?.toString(),
            maxUses: input.updates.maxUses,
            isActive: input.updates.isActive,
          });
          return { success: true };
        }),
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await deleteCoupon(input.id);
          return { success: true };
        }),
    }),
    // ── Customers ────────────────────────────────────────────────────────────────
    customers: router({
      list: adminProcedure.query(async () => {
          return await getAllCustomers();
        }),
      orderHistory: adminProcedure
        .input(z.object({ userId: z.number() }))
        .query(async ({ input }) => {
          return await getCustomerOrderHistory(input.userId);
        }),
    }),
    // ── Email Marketing ──────────────────────────────────────────────────────────
    email: router({
      getList: adminProcedure.query(async () => {
          return await getEmailListForMarketing();
        }),
      sendBroadcast: adminProcedure
        .input(
          z.object({
            subject: z.string(),
            message: z.string(),
            recipientEmails: z.array(z.string()).optional(),
          })
        )
        .mutation(async ({ input }) => {
          try {
            const db = await getDb();
            if (!db) throw new Error('Database unavailable');
            
            let targetUsers: any[] = [];
            if (input.recipientEmails && input.recipientEmails.length > 0) {
              targetUsers = await db
                .select()
                .from(users)
                .where(inArray(users.email, input.recipientEmails));
            } else {
              targetUsers = await db.select().from(users);
            }
            
            const notificationsToCreate: InsertNotification[] = targetUsers.map((user) => ({
              userId: user.id,
              type: 'promotion' as const,
              title: input.subject,
              message: input.message,
              isRead: false,
              createdAt: new Date(),
            }));
            
            if (notificationsToCreate.length > 0) {
              await db.insert(notifications).values(notificationsToCreate);
            }
            
            console.log(`[Email Broadcast] Sent to ${targetUsers.length} users`);
            return { success: true, sent: targetUsers.length };
          } catch (error) {
            console.error('[Email Broadcast Error]', error);
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to send broadcast',
            });
          }
        }),
    }),
  }),

  // ── Notifications ────────────────────────────────────────────────────────────
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getNotificationsForUser(ctx.user.id);
    }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      const count = await getUnreadCount(ctx.user.id);
      return { count };
    }),
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificationRead(input.id, ctx.user.id);
        return { success: true };
      }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
    preferences: router({
      get: protectedProcedure.query(async ({ ctx }) => {
        const prefs = await getNotificationPreferences(ctx.user.id);
        // Return defaults if not set
        return prefs ?? { orderUpdates: true, promotions: true, newArrivals: true };
      }),
      update: protectedProcedure
        .input(
          z.object({
            orderUpdates: z.boolean(),
            promotions: z.boolean(),
            newArrivals: z.boolean(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          await upsertNotificationPreferences(ctx.user.id, input);
          return { success: true };
        }),
    }),
    // Admin: broadcast a notification to all users (promotions / new arrivals)
    broadcast: adminProcedure
      .input(
        z.object({
          type: z.enum(["promotion", "new_arrival", "system"]),
          title: z.string().min(1).max(256),
          message: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const allUsers = await getAllUsersForBroadcast();
        await Promise.all(
          allUsers.map((u) =>
            createNotification({
              userId: u.id,
              type: input.type,
              title: input.title,
              message: input.message,
            })
          )
        );
        // Also push to owner via Manus notification
        await notifyOwner({
          title: `📢 Broadcast sent: ${input.title}`,
          content: `A ${input.type} notification was broadcast to ${allUsers.length} users.\n\nMessage: ${input.message}`,
        });
        return { success: true, sentTo: allUsers.length };
      }),
  }),

  // ── AI Scent Recommender ────────────────────────────────────────────────────
  ai: router({
    recommend: publicProcedure
      .input(
        z.object({
          messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })),
        })
      )
      .mutation(async ({ input }) => {
        const products = await getAllProducts();
        const productList = products
          .map((p) => `- ${p.name} (mood: ${p.mood || "any"}): ${p.scentNotes || p.description}`)
          .join("\n");

        const systemPrompt = `You are Oma, OmaLuxe Candles and Scents' elegant AI scent advisor. Your role is to help customers discover the perfect candle by asking about their mood, preferences, and what atmosphere they want to create.

Be warm, sophisticated, and conversational. Ask one or two questions at a time. After 2-3 exchanges, recommend 1-3 specific candles from our collection with a brief, evocative reason for each.

Our current collection:
${productList}

When recommending, format your suggestions like this:
**[Product Name]** — [One sentence on why it suits them]

Always end with an invitation to explore the full collection or ask more questions. Keep responses concise and elegant — never more than 3 short paragraphs.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            ...input.messages,
          ],
        });

        const rawContent = response.choices?.[0]?.message?.content;
    const content = typeof rawContent === "string" ? rawContent : "I'd love to help you find the perfect scent. Could you tell me what mood or atmosphere you're hoping to create?";
                return { content };
      }),
  }),

  // ── Wishlist ────────────────────────────────────────────────────────────────
  wishlist: router({
    add: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await addToWishlist(ctx.user.id, input.productId);
        return { success: true };
      }),
    remove: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await removeFromWishlist(ctx.user.id, input.productId);
        return { success: true };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      const items = await getWishlistItems(ctx.user.id);
      // Enrich with product info
      const enriched = await Promise.all(
        items.map(async (item) => {
          const product = await getProductById(item.productId);
          return { ...item, product };
        })
      );
      return enriched;
    }),
    isWishlisted: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input, ctx }) => {
        const result = await isProductWishlisted(ctx.user.id, input.productId);
        return { isWishlisted: result };
      }),
    count: protectedProcedure.query(async ({ ctx }) => {
      const count = await getWishlistCount(ctx.user.id);
      return { count };
    }),
  }),
  // ── Admin Analytics & Reports ───────────────────────────────────────────────
});

export type AppRouter = typeof appRouter;
