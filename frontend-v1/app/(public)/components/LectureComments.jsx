"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { LoaderCircle, MessageSquare } from "lucide-react";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import {
    CommentCard,
    RepliesModal,
} from "./DiscussionComponents";

const LectureComments = ({ courseId }) => {
    const authUser = useSelector((state) => state.auth.user);
    const [visibleCount, setVisibleCount] = useState(5);

    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState("");

    const [selectedComment, setSelectedComment] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);

    const fetchComments = async () => {
        if (!courseId) return;
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/getCourseComments/${courseId}`);
            // Sort comments by newest first
            setComments(
                response.data.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                ) || []
            );
        } catch (error) {
            console.error(error);
            // Silent error or minimal notification to avoid spamming
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [courseId]);

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;
        try {
            await axios.post("/api/addCourseComment", {
                courseId,
                comment: newComment,
            });
            setNewComment("");
            fetchComments();
            N("Success", "Comment added successfully", "success");
        } catch (error) {
            N("Error", "Failed to add comment", "error");
        }
    };

    const handleReplySubmit = async (replyText, onSuccess) => {
        try {
            const response = await axios.post("/api/addCommentReply", {
                courseCommentId: selectedComment.id,
                comment: replyText,
            });
            onSuccess();
            const newReply = response.data;
            setSelectedComment((prev) => ({
                ...prev,
                replis: [newReply, ...(prev.replis || [])].sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                ),
            }));
            fetchComments();
        } catch (error) {
            N("Error", "Failed to add reply", "error");
        }
    };

    const showReplies = (comment) => {
        setSelectedComment(comment);
        setModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoaderCircle
                    className="animate-spin text-indigo-600 dark:text-indigo-400"
                    size={32}
                />
            </div>
        );
    }

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 5);
    };

    return (
        // RESPONSIVE UPDATE: Added px-4 for mobile gutters, increased on larger screens
        <div className="w-full max-w-4xl mx-auto max-md:px-0 px-4 sm:px-6 lg:px-0">
            <div className="mb-8">
                {/* RESPONSIVE UPDATE: text-xl for mobile, text-2xl for desktop */}
                <h2 className="text-xl sm:text-2xl font-medium text-slate-900 dark:text-slate-50 mb-6">
                    Comments
                    <span className="font-light px-2">
                        (<span className="px-1">{comments.length}</span>)
                    </span>
                </h2>

                <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-12">
                    {comments.length > 0 ? (
                        comments.slice(0, visibleCount).map((comment) => (
                            <CommentCard
                                key={comment.id}
                                comment={comment}
                                onShowReplies={showReplies}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8 sm:py-12 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                            <h3 className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-50">
                                No discussions yet
                            </h3>
                            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
                                Be the first to start a conversation about this course!
                            </p>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 transition-all">
                    {/* RESPONSIVE UPDATE: Adjusted padding for icon */}
                    <div className="pl-3  sm:pl-4 text-slate-400 dark:text-slate-500">
                        <MessageSquare className="w-5 h-5" />
                    </div>

                    <input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your reply"
                        // RESPONSIVE UPDATE: 
                        // 1. 'text-base' prevents iOS zoom on focus 
                        // 2. Adjusted padding (p-3 on mobile, p-4 on desktop)
                        className="flex-1 p-3 sm:p-4 bg-transparent border-none focus:outline-none text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 min-w-0"
                        onKeyPress={(e) => e.key === "Enter" && handleCommentSubmit()}
                    />

                    <button
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim()}
                        // RESPONSIVE UPDATE: 
                        // 1. Reduced horizontal padding (px-4) on mobile to save space
                        // 2. Smaller text size on mobile
                        className="px-4 sm:px-8 py-3 sm:py-4 bg-[#D2B48C] hover:bg-[#C1A37B] text-white font-bold text-xs sm:text-sm uppercase tracking-wide transition-colors  disabled:cursor-not-allowed h-full whitespace-nowrap"
                    >
                        Reply
                    </button>
                </div>

                {/* Load More Button */}
                {visibleCount < comments.length && (
                    <div className="mt-8 flex justify-start">
                        <button
                            onClick={handleLoadMore}
                            className="flex items-center gap-2 px-6 py-3 bg-[#FFF5EB] dark:bg-[#D2B48C]/10 text-[#D2B48C] font-bold rounded-lg hover:bg-[#FFF0E0] dark:hover:bg-[#D2B48C]/20 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>

            <RepliesModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                comment={selectedComment}
                onReplySubmit={handleReplySubmit}
            />
        </div>
    );
};

export default LectureComments;