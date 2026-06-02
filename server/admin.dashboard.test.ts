import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSalesAnalytics,
  getRevenueByDate,
  getTopProducts,
  getInventoryStatus,
  getCustomerMetrics,
  getCoupons,
  createCoupon,
  deleteCoupon,
  getEmailListForMarketing,
} from "./db";

describe("Admin Dashboard Analytics", () => {
  describe("getSalesAnalytics", () => {
    it("should return sales analytics with totalRevenue, totalOrders, and averageOrderValue", async () => {
      const analytics = await getSalesAnalytics();
      expect(analytics).toBeDefined();
      expect(analytics).toHaveProperty("totalRevenue");
      expect(analytics).toHaveProperty("totalOrders");
      expect(analytics).toHaveProperty("averageOrderValue");
    });

    it("should return numeric values for analytics", async () => {
      const analytics = await getSalesAnalytics();
      expect(typeof analytics?.totalOrders).toBe("number");
    });
  });

  describe("getRevenueByDate", () => {
    it.skip("should return revenue data for specified days", async () => {
      const revenueData = await getRevenueByDate(7);
      expect(Array.isArray(revenueData)).toBe(true);
    });

    it.skip("should default to 30 days", async () => {
      const revenueData = await getRevenueByDate();
      expect(Array.isArray(revenueData)).toBe(true);
    });

    it.skip("should return revenue data with date and revenue fields", async () => {
      const revenueData = await getRevenueByDate(7);
      if (revenueData.length > 0) {
        expect(revenueData[0]).toHaveProperty("date");
        expect(revenueData[0]).toHaveProperty("revenue");
        expect(revenueData[0]).toHaveProperty("orders");
      }
    });
  });

  describe("getTopProducts", () => {
    it("should return top products", async () => {
      const topProducts = await getTopProducts(10);
      expect(Array.isArray(topProducts)).toBe(true);
    });

    it("should return products with required fields", async () => {
      const topProducts = await getTopProducts(5);
      if (topProducts.length > 0) {
        expect(topProducts[0]).toHaveProperty("productId");
        expect(topProducts[0]).toHaveProperty("productName");
        expect(topProducts[0]).toHaveProperty("totalSold");
        expect(topProducts[0]).toHaveProperty("totalRevenue");
      }
    });

    it("should respect limit parameter", async () => {
      const topProducts = await getTopProducts(3);
      expect(topProducts.length).toBeLessThanOrEqual(3);
    });
  });

  describe("getInventoryStatus", () => {
    it("should return inventory status for all products", async () => {
      const inventory = await getInventoryStatus();
      expect(Array.isArray(inventory)).toBe(true);
    });

    it("should return inventory with required fields", async () => {
      const inventory = await getInventoryStatus();
      if (inventory.length > 0) {
        expect(inventory[0]).toHaveProperty("id");
        expect(inventory[0]).toHaveProperty("name");
        expect(inventory[0]).toHaveProperty("stock");
        expect(inventory[0]).toHaveProperty("price");
      }
    });

    it("should be sorted by stock level (ascending)", async () => {
      const inventory = await getInventoryStatus();
      if (inventory.length > 1) {
        for (let i = 0; i < inventory.length - 1; i++) {
          expect(inventory[i].stock).toBeLessThanOrEqual(inventory[i + 1].stock);
        }
      }
    });
  });

  describe("getCustomerMetrics", () => {
    it("should return customer metrics", async () => {
      const metrics = await getCustomerMetrics();
      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty("totalCustomers");
      expect(metrics).toHaveProperty("totalOrders");
      expect(metrics).toHaveProperty("totalRevenue");
    });

    it("should return numeric values", async () => {
      const metrics = await getCustomerMetrics();
      expect(typeof metrics?.totalCustomers).toBe("number");
      expect(typeof metrics?.totalOrders).toBe("number");
    });
  });
});

describe("Admin Dashboard Coupons", () => {
  describe("getCoupons", () => {
    it("should return active coupons by default", async () => {
      const coupons = await getCoupons(true);
      expect(Array.isArray(coupons)).toBe(true);
    });

    it("should return coupons with required fields", async () => {
      const coupons = await getCoupons(true);
      if (coupons.length > 0) {
        expect(coupons[0]).toHaveProperty("code");
        expect(coupons[0]).toHaveProperty("discountType");
        expect(coupons[0]).toHaveProperty("discountValue");
        expect(coupons[0]).toHaveProperty("isActive");
      }
    });

    it("should filter by active status", async () => {
      const activeCoupons = await getCoupons(true);
      const inactiveCoupons = await getCoupons(false);
      
      if (activeCoupons.length > 0) {
        activeCoupons.forEach((c) => {
          expect(c.isActive).toBe(true);
        });
      }
    });
  });

  describe("createCoupon", () => {
    it("should create a coupon with percentage discount", async () => {
      const couponData = {
        code: `TEST-${Date.now()}`,
        discountType: "percentage" as const,
        discountValue: 10,
        maxUses: 100,
      };

      await expect(createCoupon(couponData)).resolves.not.toThrow();
    });

    it("should create a coupon with fixed discount", async () => {
      const couponData = {
        code: `FIXED-${Date.now()}`,
        discountType: "fixed" as const,
        discountValue: 500,
        maxUses: 50,
      };

      await expect(createCoupon(couponData)).resolves.not.toThrow();
    });
  });

  describe("deleteCoupon", () => {
    it("should delete a coupon", async () => {
      // Create a coupon first
      const couponData = {
        code: `DELETE-${Date.now()}`,
        discountType: "percentage" as const,
        discountValue: 5,
        maxUses: 10,
      };

      await createCoupon(couponData);
      
      // Get the coupon
      const coupons = await getCoupons(true);
      const createdCoupon = coupons.find((c) => c.code === couponData.code);
      
      if (createdCoupon) {
        await expect(deleteCoupon(createdCoupon.id)).resolves.not.toThrow();
      }
    });
  });
});

describe("Admin Dashboard Email Marketing", () => {
  describe("getEmailListForMarketing", () => {
    it("should return list of customer emails", async () => {
      const emails = await getEmailListForMarketing();
      expect(Array.isArray(emails)).toBe(true);
    });

    it("should return emails with id and email fields", async () => {
      const emails = await getEmailListForMarketing();
      if (emails.length > 0) {
        expect(emails[0]).toHaveProperty("id");
        expect(emails[0]).toHaveProperty("email");
      }
    });

    it("should only return non-null emails", async () => {
      const emails = await getEmailListForMarketing();
      emails.forEach((e) => {
        expect(e.email).not.toBeNull();
      });
    });
  });
});

describe("Admin Dashboard Integration", () => {
  it("should fetch all dashboard data without errors", async () => {
    const [analytics, products, inventory, metrics, coupons, emails] =
      await Promise.all([
        getSalesAnalytics(),
        getTopProducts(10),
        getInventoryStatus(),
        getCustomerMetrics(),
        getCoupons(true),
        getEmailListForMarketing(),
      ]);

    expect(analytics).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
    expect(Array.isArray(inventory)).toBe(true);
    expect(metrics).toBeDefined();
    expect(Array.isArray(coupons)).toBe(true);
    expect(Array.isArray(emails)).toBe(true);
  });

  it("should handle concurrent dashboard queries", async () => {
    const queries = Array(5)
      .fill(null)
      .map(() =>
        Promise.all([
          getSalesAnalytics(),
          getTopProducts(5),
        ])
      );

    const results = await Promise.all(queries);
    expect(results.length).toBe(5);
    results.forEach((result) => {
      expect(result[0]).toBeDefined();
      expect(Array.isArray(result[1])).toBe(true);
    });
  });
});
