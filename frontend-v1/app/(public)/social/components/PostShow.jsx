"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import moment from "moment";
import {
  MoreVertical,
  Edit,
  Trash2,
  X,
  Heart,
  MessageCircle,
  Share2,
  Globe
} from "lucide-react";

// Utils & Context
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import { useTheme } from "@/context/ThemeContext";
import { handleMultipleDocumentUpload } from "@/app/utils/common";

// Components
import CustomComment from "@/app/(public)/social/components/CustomComment.jsx";
import MultipleImageAndVideoUpload from "@/app/Components/MultipleImageAndVideoUpload";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function PostShow(postData) {
  const { darkMode } = useTheme();
  const authUser = useSelector((state) => state.auth.user);
  const router = useRouter();

  const [post, setPost] = useState(postData.post);

  // State for Edit Modal (Dialog)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedMedia, setEditedMedia] = useState([]);
  const [newMediaFiles, setNewMediaFiles] = useState([]);

  // State for Delete Confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState(null);

  // Media Viewer Modal
  const [mediaModal, setMediaModal] = useState({ visible: false, media: [], activeIndex: 0 });

  const isOwner = authUser?.id === post?.userId;

  useEffect(() => {
    setPost(postData.post);
  }, [postData.post]);

  // --- Handlers ---

  const handleOnLike = async (pst) => {
    const isLiked = pst?.likes?.some((like) => like.userId === authUser?.id);
    const updatedLikes = isLiked
      ? pst?.likes?.filter((like) => like.userId !== authUser?.id)
      : [...pst.likes, { userId: authUser?.id }];

    setPost({ ...post, likes: updatedLikes });

    try {
      const response = await axios.post("/api/likes", { id: post?.id });
      if (response?.status !== 200 || !response.data.success) {
        throw new Error("Like operation failed");
      }
    } catch (error) {
      N("Error", error?.response?.data?.message || "Failed to update like", "error");
      setPost((prevPost) => ({ ...prevPost, likes: pst?.likes }));
    }
  };

  const showEditModal = () => {
    setEditedContent(post.content);
    setEditedMedia(JSON.parse(post.media || "[]"));
    setNewMediaFiles([]);
    setIsEditModalOpen(true);
  };

  const handleUpdatePost = async () => {
    setLoading(true);
    let uploadedNewFiles = [];

    // 1. Upload new files
    if (newMediaFiles.length > 0) {
      const uploadResult = await handleMultipleDocumentUpload(
        newMediaFiles,
        "PostMedia"
      );
      if (uploadResult.success) {
        uploadedNewFiles = uploadResult.files;
      } else {
        N("Error", "Failed to upload new media.", "error");
        setLoading(false);
        return;
      }
    }

    // 2. Combine media
    const finalMedia = [...editedMedia, ...uploadedNewFiles];

    // 3. Validation
    if (!editedContent.trim() && finalMedia.length === 0) {
      N("Error", "Post must have content or media.", "error");
      setLoading(false);
      return;
    }

    // 4. API Call
    try {
      const response = await axios.put(`/api/posts/${post.id}`, {
        content: editedContent,
        media: finalMedia,
      });
      setPost(response.data.post);
      N("Success", "Post updated successfully", "success");
      setIsEditModalOpen(false);
    } catch (error) {
      N("Error", error?.response?.data?.message || "Failed to update post", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    setLoading(true);
    try {
      await axios.delete(`/api/posts/${post.id}`);
      N("Success", "Post deleted successfully", "success");
      setIsDeleteDialogOpen(false);
      if (postData.onDelete) postData.onDelete(post.id);
    } catch (error) {
      N("Error", error?.response?.data?.message || "Failed to delete post", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveExistingMedia = (mediaToRemove) => {
    setEditedMedia(
      editedMedia.filter((item) => item.publicUrl !== mediaToRemove.publicUrl)
    );
  };

  const handleRemoveNewMedia = (fileName) => {
    setNewMediaFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const toggleExpandPost = (postId) => {
    setExpandedPostId((prevId) => (prevId === postId ? null : postId));
  };

  const openMediaModal = (media, index = 0) => {
    setMediaModal({ visible: true, media, activeIndex: index });
  };

  const closeMediaModal = () => {
    setMediaModal({ visible: false, media: [], activeIndex: 0 });
  };

  // --- Comments Logic ---
  const [commentText, setCommentText] = useState("");
  const [expandedComments, setExpandedComments] = useState({});

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleTextChange = (postId, value) => {
    setCommentText((prev) => ({ ...prev, [postId]: value }));
  };

  const handleCommentSubmit = async (post) => {
    const postId = post?.id;
    if (!commentText[postId]) return;

    setCommentText((prev) => ({ ...prev, [postId]: "" }));
    try {
      const response = await axios.post("/api/comments", {
        postId,
        comment: commentText[postId],
      });
      if (response?.status === 200 && response.data.success) {
        setPost(response.data.post);
      } else {
        throw new Error("Comment operation failed");
      }
    } catch (error) {
      N("Error", error?.response?.data?.message || "Failed to update Comment", "error");
    }
  };

  // --- Render Helpers ---
  const media = JSON.parse(post?.media || "[]");
  const isContentExpanded = expandedPostId === post?.id;
  const contentPreview = isContentExpanded
    ? post?.content
    : `${post?.content?.slice(0, 150)}${post?.content?.length > 150 ? "..." : ""}`;

  const isLiked = post?.likes?.some((like) => like.userId === authUser?.id);

  const cardClass = `rounded-xl mb-4 shadow-sm border border-slate-200 dark:border-[#2F2F2F] ${darkMode ? "bg-[#1F1F1F] text-white" : "bg-white text-gray-900"
    }`;

  return (
    <div className={cardClass}>
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <Link href={"/profile/" + post?.user?.id} className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-slate-100 dark:border-slate-700">
            <AvatarImage src={post?.user?.profile?.pPic || "/default-avatar.jpg"} />
            <AvatarFallback>{post?.user?.profile?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h4 className="font-semibold text-[15px] leading-tight hover:underline cursor-pointer">
              {post?.user?.profile?.name}
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              {moment(post?.createdAt).fromNow(true)} ago · <Globe className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={showEditModal}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Post
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      {post?.content && (
        <div className="px-4 pb-3">
          <div className="text-[15px] whitespace-pre-wrap leading-normal">
            {contentPreview}
            {!isContentExpanded && post?.content?.length > 150 && (
              <span
                onClick={() => toggleExpandPost(post?.id)}
                className="text-gray-500 font-semibold cursor-pointer ml-1 hover:underline"
              >
                See more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Media - Edge to Edge */}
      {media.length > 0 && (
        <div className="mb-2">
          {media.length === 1 ? (
            <div onClick={() => openMediaModal(media, 0)} className="cursor-pointer bg-black">
              {media[0].publicUrl.endsWith(".mp4") ? (
                <video src={media[0].publicUrl} className="w-full max-h-[600px] object-contain mx-auto" controls />
              ) : (
                <img src={media[0].publicUrl} alt="Post Media" className="w-full max-h-[600px] object-cover" />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-0.5" >
              {media.slice(0, 4).map((item, idx) => (
                <div key={idx} className="relative aspect-square bg-slate-100 dark:bg-slate-800 cursor-pointer" onClick={() => openMediaModal(media, idx)}>
                  {item.publicUrl.endsWith(".mp4") ? (
                    <video src={item.publicUrl} className="w-full h-full object-cover" />
                  ) : (
                    <img src={item.publicUrl} alt="Post Media" className="w-full h-full object-cover" />
                  )}
                  {idx === 3 && media.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-2xl">
                      +{media.length - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats & Actions Container */}
      <div className="px-4">
        {/* Stats Row */}
        <div className="flex justify-between items-center py-2.5 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-[#2F2F2F]">
          <div className="flex items-center gap-1.5">
            {post?.likes?.length > 0 && (
              <div className="bg-blue-500 rounded-full p-1 w-4 h-4 flex items-center justify-center">
                <Heart className="w-2.5 h-2.5 fill-white text-white" />
              </div>
            )}
            <span>{post?.likes?.length > 0 ? post?.likes?.length : "Be the first to like this"}</span>
          </div>
          <div className="flex gap-3">
            <span>{post?.comments?.length || 0} comments</span>
            <span>{post?.views || 0} shares</span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between py-1 my-1">
          <Button
            variant="ghost"
            onClick={() => handleOnLike(post)}
            className={`flex-1 gap-2 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] ${isLiked ? "text-blue-600" : "text-gray-600 dark:text-gray-300"
              }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-blue-600" : ""}`} />
            Like
          </Button>

          <Button
            variant="ghost"
            onClick={() => toggleComments(post?.id)}
            className="flex-1 gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2F2F2F]"
          >
            <MessageCircle className="h-5 w-5" />
            Comment
          </Button>

          <Button
            variant="ghost"
            onClick={async () => {
              const url = `${window.location.origin}/social/post/${post?.id}`;
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: `Post by ${post?.user?.profile?.name}`,
                    text: post?.content,
                    url: url,
                  });
                } catch (err) {
                  // Share skipped
                }
              } else {
                navigator.clipboard.writeText(url);
                N("Success", "Link copied to clipboard", "success");
              }
            }}
            className="flex-1 gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2F2F2F]"
          >
            <Share2 className="h-5 w-5" />
            Share
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      {expandedComments[post?.id] && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-[#2F2F2F]">
          <div className="flex items-start gap-2 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={authUser?.profile?.pPic} />
              <AvatarFallback>Me</AvatarFallback>
            </Avatar>
            <div className="flex-1 relative">
              <div className={`rounded-2xl px-1 py-1 ${darkMode ? "bg-[#3A3B3C]" : "bg-[#F0F2F5]"}`}>
                <Input
                  className="w-full border-none shadow-none bg-transparent focus-visible:ring-0 placeholder:text-gray-500 dark:placeholder:text-gray-400 h-9"
                  placeholder="Write a comment..."
                  value={commentText[post?.id] || ""}
                  onChange={(e) => handleTextChange(post?.id, e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post)}
                />
              </div>
              <div className="text-[10px] text-gray-400 mt-1 px-2">Press Enter to post.</div>
            </div>
          </div>

          <div className="space-y-4">
            {post?.comments?.map((comment) => (
              <CustomComment key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Media Viewer Modal */}
      <Dialog open={mediaModal.visible} onOpenChange={(open) => !open && closeMediaModal()}>
        <DialogContent className="max-w-[900px] w-full p-0 bg-transparent border-none shadow-none text-white">
          <div className="relative flex items-center justify-center bg-black/90 h-[80vh] rounded-lg overflow-hidden">

            {mediaModal.media.length > 0 && (
              mediaModal.media[mediaModal.activeIndex].publicUrl.endsWith(".mp4") ? (
                <video src={mediaModal.media[mediaModal.activeIndex].publicUrl} controls className="max-h-full max-w-full" />
              ) : (
                <img src={mediaModal.media[mediaModal.activeIndex].publicUrl} alt="Full Media" className="max-h-full max-w-full object-contain" />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Post Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              rows={5}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="Edit your post content..."
              className="mb-4 resize-none"
            />

            <div className="mb-4">
              <p className="font-semibold mb-2 text-sm">Existing Media:</p>
              <div className="flex flex-wrap gap-2">
                {editedMedia.map((item, index) => (
                  <div key={index} className="relative group">
                    <img
                      width={100}
                      height={100}
                      src={item.publicUrl}
                      alt="media"
                      className="object-cover rounded w-24 h-24"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveExistingMedia(item)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <MultipleImageAndVideoUpload
              storeFolder="PostMedia"
              label="Upload New Media"
              files={newMediaFiles}
              handleFilesUpload={setNewMediaFiles}
              handleRemoveFile={handleRemoveNewMedia}
              inputId="post-media-upload-edit"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePost}
              className="bg-[#C106FE] hover:bg-[#a905de] text-white"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}