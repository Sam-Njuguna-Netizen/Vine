"use client";
import { useState } from "react";
import { MessageSquare, Send, X, CornerDownRight } from "lucide-react";
import moment from "moment";

const Button = ({ children, onClick, disabled = false, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    // Added dark:bg-indigo-600 dark:hover:bg-indigo-500
    className={`inline-flex items-center justify-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 ${className}`}
  >
    {children}
  </button>
);

// We use "export const" to create a named export for CommentCard
export const CommentCard = ({ comment, onShowReplies }) => {
  return (
    <div className="flex items-start space-x-4 p-4">
      <img
        src={comment.user?.profile?.pPic || "/default-avatar.jpg"}
        alt="avatar"
        className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          {/* Added dark:text-slate-100 */}
          <p className="font-bold text-gray-800 dark:text-slate-100">
            {comment.user?.profile?.name || "Anonymous"}
          </p>
          {/* Added dark:text-slate-400 */}
          <span className="text-xs text-gray-500 dark:text-slate-400">
            {moment(comment.createdAt).fromNow()}
          </span>
        </div>
        {/* Added dark:text-slate-300 */}
        <p className="mt-1 text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
          {comment.comment}
        </p>
        <button
          onClick={() => onShowReplies(comment)}
          // Added dark:text-indigo-400 dark:hover:text-indigo-300
          className="mt-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
        >
          <MessageSquare size={14} className="mr-2" />
          View Replies ({comment.replis?.length || 0})
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
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-80 flex items-center justify-center z-[1000] backdrop-blur-sm">
      {/* Added dark:bg-slate-950 */}
      <div className="bg-white dark:bg-slate-950 rounded-lg shadow-xl w-full max-w-2xl p-6 flex flex-col h-[90vh] border dark:border-slate-800">

        {/* Header */}
        {/* Added dark:border-slate-800 */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-slate-800">
          {/* Added dark:text-slate-50 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-50">Discussion Thread</h2>
          <button
            onClick={onClose}
            // Added dark:text-slate-400 dark:hover:text-slate-200
            className="text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Original Comment Highlight */}
        <div className="my-4">
          {/* Added dark:bg-slate-900 */}
          <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-transparent dark:border-slate-800">
            <img
              src={comment.user?.profile?.pPic || "/default-avatar.jpg"}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              {/* Added dark:text-slate-200 */}
              <p className="font-semibold text-gray-800 dark:text-slate-200">
                {comment.user?.profile?.name}
              </p>
              {/* Added dark:text-slate-400 */}
              <p className="mt-1 text-gray-700 dark:text-slate-400 whitespace-pre-wrap">
                {comment.comment}
              </p>
            </div>
          </div>
        </div>

        {/* Replies List */}
        <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {comment.replis?.length > 0 ? (
            comment.replis.map((reply) => (
              <div key={reply.id} className="flex items-start space-x-3 ml-6">
                <CornerDownRight
                  size={20}
                  // Added dark:text-slate-600
                  className="text-gray-400 dark:text-slate-600 mt-2 flex-shrink-0"
                />
                <img
                  src={reply.user?.profile?.pPic || "/default-avatar.jpg"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                />
                {/* Added dark:bg-slate-900/50 (using generic dark slate instead of indigo for neutral replies) */}
                <div className="flex-1 bg-indigo-50 dark:bg-slate-900 p-3 rounded-lg border border-transparent dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    {/* Added dark:text-slate-200 */}
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                      {reply.user?.profile?.name}
                    </p>
                    {/* Added dark:text-slate-500 */}
                    <span className="text-xs text-gray-500 dark:text-slate-500">
                      {moment(reply.createdAt).fromNow()}
                    </span>
                  </div>
                  {/* Added dark:text-slate-300 */}
                  <p className="mt-1 text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
                    {reply.comment}
                  </p>
                </div>
              </div>
            ))
          ) : (
            // Added dark:text-slate-500
            <p className="text-center text-gray-500 dark:text-slate-500 py-8">
              Be the first to reply!
            </p>
          )}
        </div>

        {/* Input Area */}
        {/* Added dark:border-slate-800 */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800 flex items-center space-x-3">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply..."
            // Added dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500
            className="flex-grow p-2 border border-gray-300 rounded-md bg-white dark:bg-slate-900 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500/50"
            onKeyPress={(e) => e.key === "Enter" && handlePostReply()}
          />
          <Button onClick={handlePostReply} disabled={!replyText.trim()}>
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};