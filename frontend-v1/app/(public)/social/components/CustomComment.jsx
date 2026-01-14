"use client";
import React from "react";
import moment from "moment";

const CustomComment = ({ comment }) => {
  return (
    <div key={comment.id} className="flex items-start space-x-4 p-4 border-b">
      <img
        className="w-10 h-10 rounded-full object-cover"
        src={comment?.user?.profile?.pPic || "/default-avatar.jpg"}
        alt={comment?.user?.profile?.name || "User"}
      />
      <div>
        <div className="flex items-center space-x-2">
          <span className="font-semibold">{comment?.user?.profile?.name || "Unknown User"}</span>
          <span className="text-xs text-gray-500">
            {moment(comment.createdAt).fromNow()}
          </span>
        </div>
        <p className="text-gray-700 dark:text-gray-300">{comment.comment}</p>
      </div>
    </div>
  );
};

export default CustomComment;
