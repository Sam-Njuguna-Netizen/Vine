"use client";
import { useState, useEffect } from "react";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import { useTheme } from "@/context/ThemeContext";
import CollapsibleLongText from "@/app/Components/CollapsibleLongText";
import { useParams } from "next/navigation";
import moment from "moment";
import { Star, Loader2 } from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Custom Star Rating Component
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
          className={`focus:outline-none transition-transform ${!readonly ? "hover:scale-110" : "cursor-default"
            }`}
        >
          <Star
            className={`${sizeClasses[size]} ${star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
              }`}
          />
        </button>
      ))}
    </div>
  );
};

const SingleCourseFeedbackPage = () => {
  const params = useParams();
  const courseId = params.id;
  const { darkMode } = useTheme();
  const [courseRatings, setCourseRatings] = useState([]);
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [comment, setComment] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      getCourseDetails(courseId);
      getCourseRatings(courseId);
    }
  }, [courseId]);

  const getCourseDetails = async (id) => {
    try {
      const response = await axios.get(`/api/course/${id}`);
      if (response.data) {
        setCourseTitle(response.data.title);
      }
    } catch (error) {
      N("Error", "Failed to fetch course details", "error");
    }
  };

  const getCourseRatings = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/getCourseRatings/${id}`);
      if (response.status === 200) {
        const sortedRatings = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setCourseRatings(sortedRatings);
        const avgR =
          response.data.length > 0
            ? response.data.reduce(
              (sum, item) => sum + parseFloat(item.rating),
              0
            ) / response.data.length
            : 0;
        setAverageRating(avgR);
      }
    } catch (error) {
      N("Error", "Failed to fetch ratings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      N("Warning", "Please provide a rating", "warning");
      return;
    }
    try {
      const response = await axios.post("/api/addEditCourseRating", {
        courseId: courseId,
        rating: rating,
        comment: comment.trim(),
      });
      if (response.status === 200) {
        N("Success", "Rating added successfully", "success");
        getCourseRatings(courseId);
        setRating(0);
        setComment("");
      }
    } catch (error) {
      N(
        "Error",
        error?.response?.data?.message || "Failed to add rating",
        "error"
      );
    }
  };

  if (loading && !courseTitle) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-0 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold dark:text-white">
            Feedback for {courseTitle}
          </h1>
          <p className="text-muted-foreground">
            See what students are saying about this course
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Average Rating Card */}
          <Card className="md:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Average Rating</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">
                {averageRating.toFixed(1)}
              </div>
              <StarRating value={Math.round(averageRating)} readonly size="lg" />
              <p className="text-sm text-muted-foreground">
                Based on {courseRatings.length} ratings
              </p>
            </CardContent>
          </Card>

          {/* Add Rating Card */}
          <Card className="md:col-span-2">
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
              <Button onClick={handleRatingSubmit} className="w-full sm:w-auto">
                Submit Feedback
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <Card>
          <CardHeader>
            <CardTitle>All Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">User</TableHead>
                  <TableHead className="w-[150px]">Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead className="w-[150px] text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseRatings.length > 0 ? (
                  courseRatings.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.user?.profile?.pPic} />
                            <AvatarFallback>
                              {review.user?.profile?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">
                            {review.user?.profile?.name || "Unknown User"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StarRating value={Number(review.rating)} readonly size="sm" />
                      </TableCell>
                      <TableCell>
                        <CollapsibleLongText text={review.comment} limit={100} />
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {moment(review.createdAt).format("MMM D, YYYY")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No reviews yet. Be the first to review!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SingleCourseFeedbackPage;
