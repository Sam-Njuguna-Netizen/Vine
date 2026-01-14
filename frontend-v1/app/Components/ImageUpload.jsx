"use client";

import React, { useState } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import { useSelector } from "react-redux";
import { cn } from "@/lib/utils";

const ImageUpload = ({
  storeFolder = "Default",
  label,
  imagePreview,
  handleImageUpload,
  handleRemoveImage,
  inputId,
  accept = "image/*",
  maxFileSize = 5, // Optional max file size in MB
  isProfile = false, // For circular profile images
}) => {
  const apiUrl = useSelector((state) => state.commonGLobal.apiUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      N("Error", `File size exceeds the ${maxFileSize}MB limit.`, "error");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      N("Error", "Please upload an image file", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", storeFolder);

    setIsUploading(true);

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        const data = response.data;
        N("Success", data.message, "success");
        handleImageUpload(data.publicUrl);
      } else {
        N("Error", "Error uploading", "error");
      }
    } catch (error) {
      N("Error", "Error uploading image", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    await handleFileUpload(file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  return (
    <div className="flex flex-col border overflow-hidden items-center justify-center w-full">
      {!imagePreview ? (
        <label
          htmlFor={inputId}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "cursor-pointer flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-all duration-300",
            isDragging
              ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20 scale-105"
              : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800",
            isUploading && "opacity-60 cursor-not-allowed"
          )}
        >
          <div className="flex flex-col items-center gap-2 px-4 py-6">
            {isUploading ? (
              <>
                <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Uploading...
                </p>
              </>
            ) : (
              <>
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    {isDragging ? (
                      <Upload className="w-7 h-7 text-white animate-bounce" />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-white" />
                    )}
                  </div>
                  {!isDragging && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border-2 border-purple-500">
                      <Upload className="w-3 h-3 text-purple-500" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {isDragging ? "Drop your image here" : label || "Upload Image"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {isDragging ? "Release to upload" : "Click to browse or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    JPG, PNG, GIF (Max: {maxFileSize}MB)
                  </p>
                </div>
              </>
            )}
          </div>
          <input
            id={inputId}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      ) : (
        <div className="relative group">
          <div
            className={cn(
              "overflow-hidden shadow-lg ring-2 ring-gray-200 dark:ring-gray-700 transition-all duration-300 group-hover:ring-purple-500 dark:group-hover:ring-purple-400",
              isProfile
                ? "rounded-full w-32 h-32"
                : "rounded-xl max-w-sm w-full"
            )}
          >
            <img
              src={imagePreview}
              alt="Preview"
              className={cn(
                " h-full w-[95%] object-cover transition-transform duration-300 group-hover:scale-105",
                isProfile ? "rounded-full" : "rounded-xl"
              )}
            />
          </div>
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 z-20 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Replace button overlay on hover */}
          <label
            htmlFor={inputId}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer rounded-xl"
          >
            <div className="text-center text-white">
              <Upload className="w-6 h-6 mx-auto mb-1" />
              <p className="text-sm font-medium">Change Image</p>
            </div>
            <input
              id={`${inputId}-replace`}
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
