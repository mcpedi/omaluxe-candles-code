export interface ReviewSummaryData {
  avgRating: number;
  totalReviews: number;
}

export function getReviewSummaryLabel(
  data: ReviewSummaryData | undefined,
  state: { isLoading?: boolean; isError?: boolean } = {}
): string {
  if (state.isLoading) return "Loading reviews";
  if (state.isError) return "Reviews unavailable";
  if (data?.totalReviews) {
    return `${data.avgRating.toFixed(1)} out of 5 stars from ${data.totalReviews} reviews`;
  }
  return "No reviews yet";
}
