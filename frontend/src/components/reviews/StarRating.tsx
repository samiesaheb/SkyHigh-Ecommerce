import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({ 
  rating, 
  maxRating = 5, 
  size = "md", 
  readonly = true,
  onRatingChange 
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= rating;
        
        return (
          <Star
            key={index}
            className={`${sizeClasses[size]} ${
              isFilled 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            } ${!readonly ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => handleStarClick(starNumber)}
          />
        );
      })}
      {!readonly && (
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
        </span>
      )}
    </div>
  );
}