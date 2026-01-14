"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import MultipleImageAndVideoUpload from "@/app/Components/MultipleImageAndVideoUpload";
import { handleMultipleDocumentUpload } from "@/app/utils/common";
import { PictureOutlined, VideoCameraOutlined, LoadingOutlined } from "@ant-design/icons";

const AddPostModel = ({
  isOpen = false,
  onClose,
  onPostSuccess,
  type = null,
  group = null,
  profile = null,
}) => {
  const [postContent, setPostContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const groupId = group || null;

  useEffect(() => {
    if (profile) {
      setPostContent(profile.post || "");
      setMediaFiles(profile.pictureAndVideos || []);
    }
  }, [profile]);

  useEffect(() => {
    if (isOpen && (type === "photo" || type === "video")) {
      setTimeout(() => {
        const fileInput = document.getElementById("post-media-upload");
        if (fileInput) {
          fileInput.click();
        }
      }, 300);
    }
  }, [isOpen, type]);

  useEffect(() => {
    if (!isOpen) {
      setPostContent("");
      setMediaFiles([]);
      setUploadedFiles([]);
    }
  }, [isOpen]);

  const handleSavePost = async () => {
    setIsLoading(true);
    try {
      if (mediaFiles.length > 0) {
        const upload = await handleMultipleDocumentUpload(
          mediaFiles,
          "PostMedia"
        );

        if (upload.success) {
          await postUpload(upload.files);
        } else {
          N("Error", "Error on file upload", "error");
        }
      } else {
        await postUpload();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const postUpload = async (files = []) => {
    if (!postContent && !files.length) {
      N("Error", "Upload content", "error");
      return;
    }

    const postData = {
      content: postContent,
      media: files,
      groupId,
    };

    try {
      const response = await axios.post("/api/posts", postData);
      if (response && response.status === 201) {
        onPostSuccess && onPostSuccess(true);
        N("Success", response.data.message, "success");
        onClose();
      }
    } catch (error) {
      N("Error", error?.response?.data?.message, "error");
      if (error?.response?.data?.errors?.length) {
        N("Error", error.response.data.errors[0].message, "error");
      }
    }
  };

  const handleRemoveMedia = (fileName) => {
    setMediaFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  let dynamicAllowedTypes = null;
  let modalTitle = "Create Post";
  let themeColor = "bg-blue-600 hover:bg-blue-700";

  if (type === "photo") {
    dynamicAllowedTypes = { "image/*": [".jpeg", ".png", ".jpg"] };
    modalTitle = "Add Photo";
    themeColor = "bg-green-600 hover:bg-green-700";
  } else if (type === "video") {
    dynamicAllowedTypes = { "video/*": [".mp4", ".mov", ".avi"] };
    modalTitle = "Add Video";
    themeColor = "bg-red-600 hover:bg-red-700";
  }

  // Render different headers/icons based on type to simulate separate dialogs
  const renderHeader = () => {
    if (type === "photo") {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <PictureOutlined className="text-xl" />
          <span>Add Photo</span>
        </div>
      );
    }
    if (type === "video") {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <VideoCameraOutlined className="text-xl" />
          <span>Add Video</span>
        </div>
      );
    }
    return "Create Post";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#1f1f1f] border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle>{renderHeader()}</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div>
            <Textarea
              rows={4}
              placeholder={type === 'photo' ? "Share something about this photo..." : type === 'video' ? "Describe this video..." : "What's on your mind?"}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="resize-none dark:bg-[#2b2b2b] dark:border-gray-700"
            />
          </div>

          <div>
            <MultipleImageAndVideoUpload
              storeFolder="PostMedia"
              label={type === "photo" ? "Upload Photos" : type === "video" ? "Upload Videos" : "Upload Media"}
              files={mediaFiles}
              handleFilesUpload={setMediaFiles}
              handleRemoveFile={handleRemoveMedia}
              inputId="post-media-upload"
              allowedTypes={dynamicAllowedTypes}
            />
          </div>
        </div>

        <DialogFooter className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#252525]">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button onClick={handleSavePost} className={themeColor} disabled={isLoading}>
            {isLoading && <LoadingOutlined className="mr-2" spin />}
            Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPostModel;
