import { describe, expect, it } from "vitest";
import { getReviewSummaryLabel } from "../client/src/lib/reviewSummary";

describe("ProductCard review summary", () => {
  it("formats a rated product with its average and review count", () => {
    expect(getReviewSummaryLabel({ avgRating: 4.666, totalReviews: 12 })).toBe(
      "4.7 out of 5 stars from 12 reviews"
    );
  });

  it("shows an explicit empty state for products without reviews", () => {
    expect(getReviewSummaryLabel({ avgRating: 0, totalReviews: 0 })).toBe("No reviews yet");
  });

  it("does not report an empty state while the query is loading", () => {
    expect(getReviewSummaryLabel(undefined, { isLoading: true })).toBe("Loading reviews");
  });

  it("reports unavailable reviews when the query fails", () => {
    expect(getReviewSummaryLabel(undefined, { isError: true })).toBe("Reviews unavailable");
  });
});
