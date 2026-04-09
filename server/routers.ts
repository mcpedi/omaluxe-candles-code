import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { invokeLLM } from "./_core/llm";
import {
  addCartItem,
  clearCart,
  createOrder,
  createProduct,
  deleteProduct,
  getAllOrders,
  getAllProducts,
  getBestsellerProducts,
  getCartItems,
  getFeaturedProducts,
  getOrderWithItems,
  getOrdersByUser,
  getProductById,
  getProductBySlug,
  removeCartItem,
  seedProducts,
  updateCartItem,
  updateOrderStatus,
  updateProduct,
} from "./db";

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
        return { success: true };
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
});

export type AppRouter = typeof appRouter;
