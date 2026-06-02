import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createReview,
  getReviewsByProduct,
  getAverageRating,
  deleteReview,
  updateReviewHelpful,
  getUserReview,
} from "./db";

describe("Reviews", () => {
  const testProductId = 1;
  const testUserId = 1;
  let createdReviewId: number;

  describe("createReview", () => {
    it("should create a new review", async () => {
      await createReview({
        productId: testProductId,
        userId: testUserId,
        rating: 5,
        title: "Amazing candle!",
        comment: "This candle smells incredible and burns evenly.",
      });
      
      const reviews = await getReviewsByProduct(testProductId);
      expect(reviews.length).toBeGreaterThan(0);
      createdReviewId = reviews[reviews.length - 1].id;
    });

    it("should create a review without title", async () => {
      await createReview({
        productId: testProductId,
        userId: testUserId + 1,
        rating: 4,
        comment: "Good quality product",
      });

      const reviews = await getReviewsByProduct(testProductId);
      const review = reviews.find((r) => r.userId === testUserId + 1);
      expect(review).toBeDefined();
      expect(review?.title).toBeNull();
    });
  });

  describe("getReviewsByProduct", () => {
    it("should return all reviews for a product", async () => {
      const reviews = await getReviewsByProduct(testProductId);
      expect(Array.isArray(reviews)).toBe(true);
      expect(reviews.length).toBeGreaterThan(0);
    });

    it("should return reviews sorted by newest first", async () => {
      const reviews = await getReviewsByProduct(testProductId);
      if (reviews.length > 1) {
        const first = new Date(reviews[0].createdAt).getTime();
        const second = new Date(reviews[1].createdAt).getTime();
        expect(first).toBeGreaterThanOrEqual(second);
      }
    });

    it("should return empty array for non-existent product", async () => {
      const reviews = await getReviewsByProduct(99999);
      expect(reviews.length).toBe(0);
    });
  });

  describe("getAverageRating", () => {
    it("should return average rating and total reviews", async () => {
      const result = await getAverageRating(testProductId);
      expect(result).toHaveProperty("avgRating");
      expect(result).toHaveProperty("totalReviews");
      expect(result.totalReviews).toBeGreaterThan(0);
      expect(result.avgRating).toBeGreaterThan(0);
    });

    it("should return 0 rating for non-existent product", async () => {
      const result = await getAverageRating(99999);
      expect(result.avgRating).toBe(0);
      expect(result.totalReviews).toBe(0);
    });
  });

  describe("updateReviewHelpful", () => {
    it("should increment helpful count", async () => {
      const reviews = await getReviewsByProduct(testProductId);
      const review = reviews[0];
      const initialHelpful = review.helpful || 0;

      await updateReviewHelpful(review.id, initialHelpful + 1);

      const updated = await getReviewsByProduct(testProductId);
      const updatedReview = updated.find((r) => r.id === review.id);
      expect(updatedReview?.helpful).toBe(initialHelpful + 1);
    });
  });

  describe("getUserReview", () => {
    it("should return user's review for a product", async () => {
      const review = await getUserReview(testProductId, testUserId);
      expect(review).toBeDefined();
      expect(review?.userId).toBe(testUserId);
      expect(review?.productId).toBe(testProductId);
    });

    it("should return null if user hasn't reviewed product", async () => {
      const review = await getUserReview(testProductId, 99999);
      expect(review).toBeNull();
    });
  });

  describe("deleteReview", () => {
    it("should delete a review", async () => {
      const reviews = await getReviewsByProduct(testProductId);
      const reviewToDelete = reviews[reviews.length - 1];

      await deleteReview(reviewToDelete.id);

      const updated = await getReviewsByProduct(testProductId);
      const deleted = updated.find((r) => r.id === reviewToDelete.id);
      expect(deleted).toBeUndefined();
    });
  });

  describe("Review Rating Validation", () => {
    it("should handle ratings from 1 to 5", async () => {
      for (let rating = 1; rating <= 5; rating++) {
        await createReview({
          productId: testProductId,
          userId: testUserId + rating + 100,
          rating,
          comment: `Rating ${rating} test`,
        });
      }

      const reviews = await getReviewsByProduct(testProductId);
      const ratings = reviews.map((r) => r.rating);
      expect(ratings.some((r) => r === 1)).toBe(true);
      expect(ratings.some((r) => r === 5)).toBe(true);
    });
  });
});
