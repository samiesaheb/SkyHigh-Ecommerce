"use client";

import { useState } from "react";
import { ThumbsUp, CheckCircle } from "lucide-react";
import { ProductReview } from "@/types";
import StarRating from "./StarRating";
import { fetchWithSession } from "@/lib/fetchWithSession";
import { API_ENDPOINTS } from "@/lib/config";
import { useUser } from "@/components/auth/UserContext";

interface ReviewCardProps {
  review: ProductReview;
  onHelpfulToggle?: (reviewId: number, helpful: boolean, newCount: number) => void;
}

export default function ReviewCard({ review, onHelpfulToggle }: ReviewCardProps) {
  const { user } = useUser();
  const [isHelpfulLoading, setIsHelpfulLoading] = useState(false);
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleHelpfulClick = async () => {
    if (isHelpfulLoading) return;

    // Check if user is logged in
    if (!user) {
      setShowLoginMessage(true);
      setTimeout(() => setShowLoginMessage(false), 3000); // Hide after 3 seconds
      return;
    }

    setIsHelpfulLoading(true);
    try {
      const response = await fetchWithSession(API_ENDPOINTS.REVIEWS.HELPFUL(review.id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        onHelpfulToggle?.(review.id, data.helpful, data.helpful_count);
      } else if (response.status === 401) {
        setShowLoginMessage(true);
        setTimeout(() => setShowLoginMessage(false), 3000);
      } else {
        console.error('Failed to mark review as helpful');
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    } finally {
      setIsHelpfulLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-red-700">
              {review.user_initials}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{review.user_name}</p>
              {review.verified_purchase && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">Verified Purchase</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            onClick={handleHelpfulClick}
            disabled={isHelpfulLoading}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              review.user_found_helpful
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            <ThumbsUp className={`w-4 h-4 ${review.user_found_helpful ? 'fill-current' : ''}`} />
            <span>
              Helpful {review.helpful_count > 0 && `(${review.helpful_count})`}
            </span>
          </button>

          {/* Login Message */}
          {showLoginMessage && (
            <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap z-10">
              You need to be logged in
              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}