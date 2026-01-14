"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

import {
  CommentCard,
  RepliesModal,
} from "../../../../Components/DiscussionComponents";

const DiscussionPage = () => {
  const params = useParams();
  const courseId = params.id;
  const authUser = useSelector((state) => state.auth.user);

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
      N("Error", "Failed to fetch discussion", "error");
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
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-indigo-600 h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="p-0 sm:p-8 min-h-screen">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/courses"
              className="flex items-center text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 mb-2 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" /> Back to Courses
            </Link>
            <h1 className="text-3xl font-bold dark:text-white text-center sm:text-start">
              Course Discussion
            </h1>
          </div>
        </div>

        <Card className="mb-8 border-none shadow-md dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={authUser?.profile?.pPic} />
                <AvatarFallback>{authUser?.profile?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ask a question or start a discussion..."
                className="flex-1"
                onKeyPress={(e) => e.key === "Enter" && handleCommentSubmit()}
              />
              <Button
                onClick={handleCommentSubmit}
                disabled={!newComment.trim()}
                size="icon"
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Send size={18} />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onShowReplies={showReplies}
              />
            ))
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">
                No discussions yet.
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Be the first to start a conversation!
              </p>
            </div>
          )}
        </div>
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

export default DiscussionPage;
