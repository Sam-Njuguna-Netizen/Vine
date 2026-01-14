"use client";
import { useState, useEffect } from 'react';
import axios from '@/app/api/axios';
import { N } from '@/app/utils/notificationService';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { Star, MoreHorizontal, CheckCircle2, Filter } from 'lucide-react';
import StarRating from '@/app/Components/StarRating';

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";

const BookReviews = ({ bookId, initialReviews = '[]' }) => {
    const authUser = useSelector((state) => state.auth.user);

    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sortBy, setSortBy] = useState("latest");
    const [showWriteReview, setShowWriteReview] = useState(false);

    useEffect(() => {
        try {
            const parsedReviews = JSON.parse(initialReviews);
            if (Array.isArray(parsedReviews)) {
                setReviews(parsedReviews);
            }
        } catch (e) {
            setReviews([]);
        }
    }, [initialReviews]);

    const handleRatingSubmit = async () => {
        if (!authUser) {
            N("Warning", "Please log in to submit a review.", "warning");
            return;
        }
        if (rating === 0) {
            N("Warning", "Please select a rating between 1 and 5.", "warning");
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await axios.post(`/api/books/${bookId}/reviews`, {
                rating,
                comment: comment.trim(),
            });
            if (response.status === 200) {
                N("Success", "Your review has been submitted!", "success");
                fetchBookReviews();
                setRating(0);
                setComment("");
                setShowWriteReview(false);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to submit review. Please try again.";
            N("Error", errorMessage, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchBookReviews = async () => {
        try {
            const response = await axios.get(`/api/book/${bookId}`);
            if (response.data && response.data.reviews) {
                setReviews(JSON.parse(response.data.reviews));
            }
        } catch (error) {
            console.error("Could not refresh reviews");
        }
    };

    const sortedReviews = [...reviews].sort((a, b) => {
        if (sortBy === "latest") {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortBy === "oldest") {
            return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (sortBy === "highest") {
            return b.rating - a.rating;
        } else if (sortBy === "lowest") {
            return a.rating - b.rating;
        }
        return 0;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    All Reviews
                    <span className="text-gray-400 text-lg font-normal">({reviews.length})</span>
                </h3>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[110px] border-none bg-transparent shadow-none focus:ring-0 h-8 p-0 text-sm font-medium">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="latest">Latest</SelectItem>
                                <SelectItem value="oldest">Oldest</SelectItem>
                                <SelectItem value="highest">Highest</SelectItem>
                                <SelectItem value="lowest">Lowest</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={() => setShowWriteReview(!showWriteReview)}
                        className="bg-[#1d4ed8] hover:bg-blue-800 text-white rounded-full px-6 "
                    >
                        Write a Review
                    </Button>
                </div>
            </div>

            {/* Write Review Form */}
            {showWriteReview && (
                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm animate-in slide-in-from-top-4 duration-300">
                    <CardContent className="p-6 space-y-4">
                        <h4 className="font-semibold text-lg">Write a review</h4>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rating</label>
                            <StarRating value={rating} onChange={setRating} size="lg" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Your Review</label>
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="What did you like or dislike? What did you use this product for?"
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowWriteReview(false)}>Cancel</Button>
                            <Button onClick={handleRatingSubmit} disabled={isSubmitting || rating === 0} className="bg-gradient-to-r from-[#701A75] to-[#1E40AF] hover:bg-blue-800">
                                {isSubmitting ? "Submitting..." : "Submit Review"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedReviews.map((review, index) => (
                    <Card key={index} className="border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-1 text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-gray-200 dark:text-gray-700"}`}
                                        />
                                    ))}
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Report Review</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                                <h4 className="font-bold text-gray-900 dark:text-white">
                                    {review.userName || 'Anonymous'}
                                </h4>
                                <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-100" />
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 min-h-[60px]">
                                "{review.comment}"
                            </p>

                            <p className="text-xs text-gray-400 font-medium">
                                Posted on {moment(review.createdAt).format('MMMM D, YYYY')}
                            </p>
                        </CardContent>
                    </Card>
                ))}

                {sortedReviews.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed">
                        <p className="text-gray-500">No reviews yet. Be the first to write one!</p>
                    </div>
                )}
            </div>

            {sortedReviews.length > 0 && (
                <div className="flex justify-center pt-4">
                    <Button variant="outline" className="rounded-full px-8">
                        Load More Reviews
                    </Button>
                </div>
            )}
        </div>
    );
};

export default BookReviews;
