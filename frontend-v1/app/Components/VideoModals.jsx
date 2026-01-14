"use client";
import { useState, useRef, useEffect } from "react";
import { UploadCloud, X } from "lucide-react";

import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import { checkObjectFields } from "@/app/utils/common";
import { DragDropFileUpload } from "@/app/Components/DragDropFileUpload";

// --- Reusable Button Component ---
const Button = ({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

// --- Video Player Modal Component ---
export const VideoPlayerModal = ({ isOpen, onClose, videoUrl, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000]">
      <div className="dark:bg-[#141414] rounded-lg shadow-xl w-full max-w-4xl p-4 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>
        <video
          key={videoUrl}
          className="w-full"
          controls
          autoPlay
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

// --- Add Video Modal Component ---
export const AddVideoModal = ({ isOpen, onClose, onSave, courseId }) => {
  const [videoInfo, setVideoInfo] = useState({
    serialNo: "",
    title: "",
    description: "",
  });
  const [videoPreview, setVideoPreview] = useState(null);
  const [path, setPath] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Reset form when modal is closed or opened
    if (isOpen) {
      setVideoInfo({ serialNo: "", title: "", description: "" });
      setVideoPreview(null);
      setPath("");
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVideoInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setVideoPreview(URL.createObjectURL(file));
    setIsUploading(true);

    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await axios.post("/api/upload-video", formData);
      if (response && response.status === 201) {
        N("Success", response.data.message, "success");
        setPath(response.data?.publicUrl);
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      N("Error", "Failed to upload video.", "error");
      handleRemoveVideo();
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveVideo = () => {
    setVideoPreview(null);
    setPath("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFinalSave = () => {
    const finalVideoInfo = { ...videoInfo, path, courseId };

    const ch = checkObjectFields(finalVideoInfo, ["description"]);
    if (!ch.success) {
      N("Error", ch.message, "error");
      return;
    }

    onSave(finalVideoInfo);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="bg-[#141414]  rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-4 video-modal">
        <h2 className="text-2xl font-bold dark:text-white text-white">
          Add New Video
        </h2>

        <div>
          <label className="block text-sm font-medium mb-1 text-white dark:text-gray-900">
            Serial No*
          </label>
          <input
            type="number"
            name="serialNo"
            placeholder="Enter Serial No"
            value={videoInfo.serialNo}
            onChange={handleInputChange}
            className="w-full  px-3 py-2 border dark:text-white dark:bg-[#141414]  border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-white ">
            Title*
          </label>
          <input
            name="title"
            placeholder="Enter Title"
            value={videoInfo.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border dark:text-white dark:bg-[#141414] border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-white">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder="Enter Description"
            value={videoInfo.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border dark:text-white dark:bg-[#141414] border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium dark:bg-[#141414] mb-2 text-white">
            Video*
          </label>
          {!videoPreview ? (
            <DragDropFileUpload
              onFileSelect={(file) => handleVideoUpload({ target: { files: [file] } })}
              selectedFile={path ? { name: "Current Video", previewUrl: path } : null}
              label="Click or Drag Upload Video"
              accept="video/*"
              disabled={isUploading}
            />
          ) : (
            <div className="relative mt-2 w-full">
              <video
                src={videoPreview}
                controls
                className="w-full rounded-lg shadow-md"
              />
              <button
                onClick={handleRemoveVideo}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Cancel
          </Button>
          <Button onClick={handleFinalSave} disabled={isUploading || !path}>
            {isUploading ? "Uploading..." : "Save Video"}
          </Button>
        </div>
      </div>
    </div>
  );
};
