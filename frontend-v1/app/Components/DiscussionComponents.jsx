"use client";
import { useEffect, useState } from "react";
import { MessageSquare, Send, X, CornerDownRight } from "lucide-react";
import moment from "moment";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export const CommentCard = ({ comment, onShowReplies }) => {
  const isAdmin = comment.user?.userRole?.role_name === 'Admin';

  return (
    <div className="flex items-start space-x-4 p-0 bg-transparent">

      <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
        <AvatarImage src={comment.user?.profile?.pPic} alt={comment.user?.profile?.name || "User"} />
        <AvatarFallback>{comment.user?.profile?.name?.charAt(0) || "U"}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-bold text-base text-slate-900 dark:text-slate-100">
            {comment.user?.profile?.name || "Anonymous"}
          </p>
          {isAdmin && (
            <span className="bg-[#6366F1] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              ADMIN
            </span>
          )}
          <span className="text-sm text-slate-400 dark:text-slate-500">
            • {moment(comment.createdAt).fromNow()}
          </span>
        </div>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
          {comment.comment}
        </p>
        <button
          onClick={() => onShowReplies(comment)}
          className="flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors text-sm font-medium uppercase tracking-wide"
        >
          <MessageSquare size={16} className="mr-2" />
          REPLY
          {comment.replis?.length > 0 && <span className="ml-1">({comment.replis.length})</span>}
        </button>
      </div>
    </div>
  );
};

// We also use "export const" for RepliesModal
export const RepliesModal = ({ isOpen, onClose, comment, onReplySubmit }) => {
  const [replyText, setReplyText] = useState("");

  const handlePostReply = () => {
    // We call the function passed from the parent and clear the text field on success
    onReplySubmit(replyText, () => setReplyText(""));
  };

  if (!isOpen || !comment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-white dark:bg-slate-900 shadow-xl rounded-xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Discussion Thread
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-6">
          {/* Original Comment */}
          <div className="flex items-start space-x-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={comment.user?.profile?.pPic} />
              <AvatarFallback>{comment.user?.profile?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {comment.user?.profile?.name}
                </p>
                {comment.user?.userRole?.role_name === 'Admin' && (
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {comment.comment}
              </p>
            </div>
          </div>

          <div className="pl-6 space-y-4">
            {comment.replis?.length > 0 ? (
              comment.replis.map((reply) => (
                <div key={reply.id} className="flex items-start space-x-3 relative">
                  <div className="absolute -left-4 top-3 w-3 h-3 border-l-2 border-b-2 border-slate-200 rounded-bl-lg" />
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={reply.user?.profile?.pPic} />
                    <AvatarFallback>{reply.user?.profile?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {reply.user?.profile?.name}
                        </p>
                        {reply.user?.userRole?.role_name === 'Admin' && (
                          <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {moment(reply.createdAt).fromNow()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {reply.comment}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No replies yet. Be the first to reply!
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
          <div className="flex items-center space-x-3">
            <Input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              className="flex-grow bg-white dark:bg-slate-800"
              onKeyPress={(e) => e.key === "Enter" && handlePostReply()}
            />
            <Button onClick={handlePostReply} disabled={!replyText.trim()} size="icon">
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
