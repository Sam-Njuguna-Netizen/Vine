import React, { useState } from "react";
import { X } from "lucide-react";

const previewableExtensions = [
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
];

const getExtension = (url) => {
  if (!url) return "";
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.split(".").pop()?.toLowerCase() || "";
  } catch {
    const cleanPath = url.split("?")[0];
    return cleanPath.split(".").pop()?.toLowerCase() || "";
  }
};

const FullscreenDocViewer = ({
  open,
  url,
  title,
  onClose,
  showContent = true,
}) => {
  console.log("Document URL:", url);
  if (!open || !url) return null;

  const ext = getExtension(url);
  const isPreviewable = previewableExtensions.includes(ext);
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext);
  const isPdf = ext === "pdf";
  const isOffice = ["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext);

  // For images: track loading state
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="fixed inset-0 bg-black z-[999999999] flex flex-col">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-black text-white p-2 rounded-full hover:bg-gray-800 z-10"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Document Viewer */}
      <div className="flex-1 w-full h-full relative">
        {isPreviewable && showContent ? (
          isImage ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              {!imageLoaded && !imageError && (
                <div className="text-center text-white">
                  <p className="text-lg font-medium">Fetching your file...</p>
                  <p className="text-sm text-gray-300 mt-2">
                    Please wait a moment while we retrieve your file from its
                    home on the internet
                  </p>
                </div>
              )}
              <img
                src={url}
                alt={title || "Preview"}
                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageLoaded(true);
                  setImageError(true);
                }}
                style={{ display: imageError ? "none" : "block" }}
              />
              {imageError && (
                <div className="text-red-400 text-center absolute inset-0 flex items-center justify-center">
                  <div>
                    <p className="text-lg font-medium">Failed to load image</p>
                    <a
                      href={url}
                      download={title}
                      className="mt-2 inline-block px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                    >
                      Download Image
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : isPdf ? (
            <embed
              src={`${url}#zoom=85&scrollbar=1&toolbar=1`}
              type="application/pdf"
              className="w-full h-full"
            />
          ) : isOffice ? (
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                url
              )}`}
              className="w-full h-full"
              frameBorder="0"
              title="Document Preview"
            />
          ) : null
        ) : (
          <div className="flex flex-col items-ce  nter justify-center h-full text-white px-4 text-center">
            <p className="text-lg font-medium">
              Preview not available for this file type.
            </p>
            <a
              href={url}
              download={title}
              className="mt-4 px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition"
            >
              Download File
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullscreenDocViewer;
