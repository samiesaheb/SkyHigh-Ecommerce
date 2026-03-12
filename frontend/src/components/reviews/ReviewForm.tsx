"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { ReviewFormData } from "@/types";
import StarRating from "./StarRating";
import { fetchWithSession } from "@/lib/fetchWithSession";
import { API_ENDPOINTS } from "@/lib/config";

interface ReviewFormProps {
  productId: number;
  productName: string;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ 
  productId, 
  productName, 
  onClose, 
  onReviewSubmitted 
}: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    product: productId,
    rating: 0,
    title: "",
    comment: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      setError("Please select a rating");
      return;
    }
    
    if (!formData.title.trim()) {
      setError("Please enter a review title");
      return;
    }
    
    if (!formData.comment.trim()) {
      setError("Please enter a review comment");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetchWithSession(API_ENDPOINTS.REVIEWS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onReviewSubmitted();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || errorData.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Write a Review</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">{productName}</h3>
            <p className="text-sm text-gray-600">
              Share your experience with this Geometry product
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Overall Rating *
            </label>
            <StarRating
              rating={formData.rating}
              readonly={false}
              size="lg"
              onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
            />
          </div>

          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Review Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Give your review a title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Your Review *
            </label>
            <textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Tell others about your experience with this product"
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}