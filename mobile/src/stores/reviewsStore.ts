import { create } from 'zustand';

interface ReviewsStore {
  // State
  reviews: any[];
  reviewSummary: any;
  isLoading: boolean;
  error: string | null;

  // Actions
  clearReviews: () => void;
  markReviewHelpful: (reviewId: number) => Promise<void>;
}

export const useReviewsStore = create<ReviewsStore>((set, get) => ({
  // Initial state
  reviews: [],
  reviewSummary: null,
  isLoading: false,
  error: null,

  // Actions
  markReviewHelpful: async (reviewId: number) => {
    try {
      console.log('Marking review helpful:', reviewId);
    } catch (error) {
      console.log('Error marking review helpful');
    }
  },

  clearReviews: () => {
    set({
      reviews: [],
      reviewSummary: null,
      error: null,
    });
  },
}));

export default useReviewsStore;