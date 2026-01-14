"use client";
import { useState } from "react";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import { Star } from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Internal Star Rating Component (Helper)
const StarRating = ({ value, onChange, readonly = false, size = "md" }) => {
  const stars = [1, 2, 3, 4, 5];
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(star)}
          className={`focus:outline-none transition-transform ${
            !readonly ? "hover:scale-110" : "cursor-default"
          }`}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const AddCourseReview = ({ courseId, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      N("Warning", "Please provide a rating", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/addEditCourseRating", {
        courseId: courseId,
        rating: rating,
        comment: comment.trim(),
      });

      if (response.status === 200) {
        N("Success", "Rating added successfully", "success");
        setRating(0);
        setComment("");
        
        // Trigger the callback function if provided by parent
        if (onReviewAdded) {
          onReviewAdded();
        }
      }
    } catch (error) {
      N(
        "Error",
        error?.response?.data?.message || "Failed to add rating",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Add Your Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Rating</label>
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Comment</label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this course..."
            rows={4}
          />
        </div>
        <Button 
          onClick={handleRatingSubmit} 
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AddCourseReview;