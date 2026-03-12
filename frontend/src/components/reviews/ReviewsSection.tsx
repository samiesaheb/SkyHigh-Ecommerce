"use client";

import { useState, useEffect } from "react";
import { Plus, Filter } from "lucide-react";
import { ProductDetail, ProductReview } from "@/types";
import { useUser } from "@/components/auth/UserContext";
import StarRating from "./StarRating";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";

interface ReviewsSectionProps {
  product: ProductDetail;
  onReviewsUpdate?: () => void;
}

export default function ReviewsSection({ product, onReviewsUpdate }: ReviewsSectionProps) {
  const { user } = useUser();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>(product.reviews || []);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  
  // Only show reviews for Geometry products
  const isGeometryProduct = product.brand.slug === 'geometry';

  useEffect(() => {
    setReviews(product.reviews || []);
  }, [product.reviews]);

  if (!isGeometryProduct) {
    return null; // Don't show reviews for non-Geometry products
  }

  const handleReviewSubmitted = () => {
    onReviewsUpdate?.();
  };

  const handleHelpfulToggle = (reviewId: number, helpful: boolean, newCount: number) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, user_found_helpful: helpful, helpful_count: newCount }
        : review
    ));
  };

  const sortedAndFilteredReviews = reviews
    .filter(review => filterRating === null || review.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'rating_high':
          return b.rating - a.rating;
        case 'rating_low':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpful_count - a.helpful_count;
        default:
          return 0;
      }
    });

  const getRatingBarWidth = (rating: number) => {
    const total = product.review_count;
    if (total === 0) return 0;
    const count = product.rating_distribution?.[rating.toString()] || 0;
    return (count / total) * 100;
  };

  return (
    <div className="mt-12">
      <div className="border-t border-gray-200 pt-8">
        {/* Reviews Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Customer Reviews</h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <StarRating rating={product.average_rating || 0} size="md" />
                <span className="text-lg font-medium">
                  {product.average_rating ? product.average_rating.toFixed(1) : '0.0'}
                </span>
                <span className="text-gray-500">
                  ({product.review_count} review{product.review_count !== 1 ? 's' : ''})
                </span>
              </div>
            </div>
          </div>

          {user && !product.user_has_reviewed && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Write Review
            </button>
          )}
        </div>

        {/* Rating Distribution */}
        {product.review_count > 0 && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">Rating Breakdown</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-sm">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${getRatingBarWidth(rating)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 min-w-0">
                    {product.rating_distribution?.[rating.toString()] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Sort */}
        {reviews.length > 0 && (
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating_high">Highest Rating</option>
                <option value="rating_low">Lowest Rating</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Filter by rating:</span>
              <select
                value={filterRating || ''}
                onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {sortedAndFilteredReviews.length > 0 ? (
          <div className="space-y-6">
            {sortedAndFilteredReviews.map(review => (
              <ReviewCard
                key={review.id}
                review={review}
                onHelpfulToggle={handleHelpfulToggle}
              />
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No reviews match your current filters.</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No reviews yet. Be the first to review this product!</p>
            {user && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Write First Review
              </button>
            )}
          </div>
        )}

        {/* Review Form Modal */}
        {showReviewForm && (
          <ReviewForm
            productId={product.id}
            productName={product.name}
            onClose={() => setShowReviewForm(false)}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}
      </div>
    </div>
  );
}

// Add the missing Star component import
import { Star } from "lucide-react";