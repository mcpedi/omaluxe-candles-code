import { useState } from "react";
import { Star, ThumbsUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ProductReviewsProps {
  productId: number;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  // Queries
  const { data: reviews = [], isLoading: reviewsLoading } = trpc.reviews.list.useQuery({ productId });
  const { data: avgData = { avgRating: 0, totalReviews: 0 } } = trpc.reviews.averageRating.useQuery({ productId });

  // Mutations
  const createReviewMutation = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("Review posted successfully!");
      setTitle("");
      setComment("");
      setRating(5);
      setShowForm(false);
      utils.reviews.list.invalidate({ productId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to post review");
    },
  });

  const deleteReviewMutation = trpc.reviews.delete.useMutation({
    onSuccess: () => {
      toast.success("Review deleted");
      utils.reviews.list.invalidate({ productId });
    },
    onError: () => {
      toast.error("Failed to delete review");
    },
  });

  const markHelpfulMutation = trpc.reviews.markHelpful.useMutation({
    onSuccess: () => {
      utils.reviews.list.invalidate({ productId });
    },
  });

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Please sign in to leave a review");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    createReviewMutation.mutate({
      productId,
      rating,
      title: title || undefined,
      comment,
    });
  };

  const renderStars = (count: number, interactive = false, onRate?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate?.(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`transition-colors ${
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
            }`}
            disabled={!interactive}
          >
            <Star
              size={16}
              className={`${
                star <= (hoverRating || count)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 mt-8 border-t pt-8">
      <div>
        <h3 className="text-2xl font-bold mb-4">Customer Reviews</h3>

        {/* Rating Summary */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-4xl font-bold">{avgData.avgRating.toFixed(1)}</div>
              <div className="flex gap-1 mt-1">{renderStars(Math.round(avgData.avgRating))}</div>
              <p className="text-sm text-gray-600 mt-1">{avgData.totalReviews} reviews</p>
            </div>
          </div>
        </div>

        {/* Write Review Button */}
        {user && !showForm && (
          <Button onClick={() => setShowForm(true)} className="mb-6">
            Write a Review
          </Button>
        )}

        {/* Review Form */}
        {showForm && (
          <Card className="p-6 mb-6">
            <h4 className="font-semibold mb-4">Share Your Experience</h4>

            {/* Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-2">
                {renderStars(rating, true, setRating)}
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Review Title (Optional)</label>
              <Input
                placeholder="e.g., Amazing scent!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Your Review</label>
              <Textarea
                placeholder="Share your thoughts about this product..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitReview}
                disabled={createReviewMutation.isPending}
              >
                {createReviewMutation.isPending ? "Posting..." : "Post Review"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviewsLoading ? (
            <p className="text-gray-600">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex gap-2 items-center">
                      {renderStars(review.rating)}
                      {review.title && (
                        <span className="font-semibold">{review.title}</span>
                      )}
                    </div>
                  </div>
                  {user?.id === review.userId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteReviewMutation.mutate({ id: review.id })}
                      disabled={deleteReviewMutation.isPending}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>

                <p className="text-gray-700 mb-3">{review.comment}</p>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => markHelpfulMutation.mutate({ id: review.id })}
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    <ThumbsUp size={14} />
                    <span>Helpful ({review.helpful || 0})</span>
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
