"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import {
  FileText,
  Image as ImageIcon,
  File,
  PlayCircle,
  Plus,
  Loader2,
  Download,
  Music,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import Link from "next/link";
import { DragDropFileUpload } from "@/app/Components/DragDropFileUpload";

export default function BookMaterials() {
  const authUser = useSelector((state) => state.auth.user);
  const { id } = useParams();
  const [materials, setMaterials] = useState([]);
  const [bookInfo, setBookInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [path, setFilePath] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Preview modal
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState(null);

  useEffect(() => {
    if (id) {
      fetchBookMaterials();
    }
  }, [id]);

  const fetchBookMaterials = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/bookMaterials/${id}`);
      console.log("Book materials response:", res.data);
      setMaterials(res.data.meterials || []);
      // Assuming the API might return book info as well, if not, we might need another call
      // For now, we'll rely on the previous implementation which seemed to expect it but didn't explicitly set it from this call in the provided code.
      // If bookInfo is needed, it should be fetched.
    } catch (err) {
      N(
        "Error",
        err?.response?.data?.message || "Failed to load materials",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (path) => {
    const ext = path?.split(".").pop().toLowerCase();
    if (ext === "pdf")
      return <FileText className="text-red-500 h-8 w-8" />;
    if (["doc", "docx"].includes(ext))
      return <FileText className="text-blue-500 h-8 w-8" />;
    if (["jpg", "jpeg", "png", "webp"].includes(ext))
      return <ImageIcon className="text-green-500 h-8 w-8" />;
    if (["mp4", "mov"].includes(ext))
      return <PlayCircle className="text-orange-500 h-8 w-8" />;
    if (["mp3", "wav", "m4a", "ogg"].includes(ext))
      return <Music className="text-purple-500 h-8 w-8" />;
    return <File className="text-gray-500 h-8 w-8" />;
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "BookMaterial");

    try {
      const res = await axios.post("/api/upload", formData);
      if (res.status === 200) {
        setFilePath(res.data.publicUrl);
        N("Success", "File uploaded successfully", "success");
      }
    } catch (err) {
      N("Error", "Upload failed", "error");
    }
  };

  const handleAddMaterial = async () => {
    try {
      if (!title) {
        N("Error", "Please enter a name", "error");
        return;
      }
      if (!path) {
        N("Error", "Please upload a file", "error");
        return;
      }

      const res = await axios.post("/api/bookMaterials", {
        bookId: id,
        title: title,
        description: description,
        path,
      });

      if (res.status === 201) {
        N("Success", "Material added successfully", "success");
        setAddModalVisible(false);
        setFilePath(null);
        setTitle("");
        setDescription("");
        fetchBookMaterials();
      }
    } catch (err) {
      N("Error", "Failed to add material", "error");
    }
  };

  const handlePreviewMaterial = (material) => {
    setPreviewMaterial(material);
    setPreviewVisible(true);
  };

  // Fixed download function with better error handling
  const handleDownload = async (material, e) => {
    e.stopPropagation();
    e?.preventDefault?.(); // Prevent default navigation

    try {
      const fileUrl = `${material.path}`;
      console.log("Downloading from:", fileUrl); // Debug log

      // Method 1: Try fetch first for better control
      try {
        const response = await fetch(fileUrl);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = url;
          link.download = getFileName(material);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          N("Success", "Download started", "success");
          return;
        }
      } catch (fetchError) {
        console.log("Fetch method failed, trying alternative:", fetchError);
      }

      // Method 2: Fallback to direct link
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = getFileName(material);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      N("Error", "Download failed. Please try again.", "error");

      // Final fallback: open in new tab
      window.open(`${material.path}`, "_blank");
    }
  };

  // Helper function to get proper filename
  const getFileName = (material) => {
    if (material.title) {
      const ext = material.path.split(".").pop();
      const title = material.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      return `${title}.${ext}`;
    }
    return material.path.split("/").pop() || "download";
  };

  const renderPreview = () => {
    if (!previewMaterial?.path) return null;

    const fullUrl = `${previewMaterial.path}`;
    const ext = previewMaterial.path.split(".").pop().toLowerCase();
    const isDoc = ["pdf", "doc", "docx"].includes(ext);
    const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
    const isVideo = ["mp4", "mov", "avi", "webm"].includes(ext);
    const isAudio = ["mp3", "wav", "m4a", "ogg"].includes(ext);

    console.log("Preview URL:", fullUrl); // Debug log

    if (isDoc) {
      if (ext === "pdf") {
        // Direct PDF embed - more reliable than Google Docs viewer
        return (
          <div className="w-full h-[600px]">
            <iframe
              src={fullUrl}
              className="w-full h-full border-0 rounded-md"
              title="PDF Preview"
            />
          </div>
        );
      } else {
        // For DOC/DOCX files, use Google Docs viewer
        return (
          <div className="w-full h-[600px]">
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(
                fullUrl
              )}&embedded=true`}
              className="w-full h-full border-0 rounded-md"
              title="Document Preview"
            />
          </div>
        );
      }
    }

    if (isImage) {
      return (
        <div className="text-center">
          <img
            src={fullUrl}
            alt="Preview"
            className="max-w-full max-h-[600px] rounded shadow-lg mx-auto"
            onError={(e) => {
              console.error("Image load error:", e);
              e.target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext y='50' x='10'%3EImage not found%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="text-center">
          <video
            controls
            className="max-w-full max-h-[600px] rounded shadow-lg mx-auto"
            onError={(e) => {
              console.error("Video load error:", e);
            }}
          >
            <source src={fullUrl} type={`video/${ext}`} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="text-center py-8">
          <div className="mb-4 flex justify-center">
            <Music className="h-16 w-16 text-purple-500 mb-4" />
          </div>
          <audio
            controls
            className="w-full max-w-md mx-auto mb-4"
            onError={(e) => {
              console.error("Audio load error:", e);
            }}
          >
            <source src={fullUrl} type={`audio/${ext}`} />
            Your browser does not support the audio tag.
          </audio>
          <p className="text-lg font-medium">
            {previewMaterial.title || "Audio File"}
          </p>
          <p className="text-muted-foreground text-sm">
            File type: {ext.toUpperCase()}
          </p>
        </div>
      );
    }

    return (
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <File className="h-16 w-16 text-gray-400" />
        </div>
        <p className="text-muted-foreground">
          Preview not supported for this file type.
        </p>
        <p className="text-muted-foreground text-sm">File type: {ext.toUpperCase()}</p>
        <Button
          onClick={() =>
            handleDownload(previewMaterial, { stopPropagation: () => { } })
          }
          className="mt-4 gap-2"
        >
          <Download className="h-4 w-4" />
          Download File
        </Button>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Book Info */}
      {bookInfo && (
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-primary">
            {bookInfo.title}
          </h3>
          <p className="text-muted-foreground">{bookInfo.description}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h4 className="text-xl font-semibold">Materials</h4>
        <div className="flex gap-2">
          <Link href={authUser?.roleId === 1 ? "/admin/book" : "/book"}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          {authUser?.roleId === 1 && (
            <Button
              onClick={() => setAddModalVisible(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" /> Add Material
            </Button>
          )}
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mr-2" /> Loading...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {materials.map((item, index) => (
            <Card
              key={index}
              onClick={() => handlePreviewMaterial(item)}
              className="cursor-pointer hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                {getFileIcon(item.path)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownload(item, e);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base font-medium mb-1 truncate">
                  {item.title || "Untitled"}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description || "No description"}
                </p>
              </CardContent>
            </Card>
          ))}
          {materials.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-lg">
              No materials found for this book.
            </div>
          )}
        </div>
      )}

      {/* Add Material Dialog */}
      <Dialog open={addModalVisible} onOpenChange={setAddModalVisible}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Material</DialogTitle>
            <DialogDescription>
              Upload a new file for this book.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Material Name</Label>
              <Input
                id="title"
                placeholder="Ex: Chapter 1 Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Short description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload File</Label>
              <DragDropFileUpload
                onFileSelect={(file) => handleDocumentUpload({ target: { files: [file] } })}
                selectedFile={path ? { name: path.split('/').pop(), previewUrl: path } : null}
                label="Click or Drag to Upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mp3,.wav,.m4a,.ogg"
              />
              {path && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 mt-2">
                  File uploaded
                </Badge>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddModalVisible(false);
              setTitle("");
              setDescription("");
              setFilePath(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddMaterial}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewVisible} onOpenChange={setPreviewVisible}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewMaterial && getFileIcon(previewMaterial.path)}
              <span className="truncate">{previewMaterial?.title || "Preview"}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-[200px] py-4">
            {renderPreview()}
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                previewMaterial && handleDownload(previewMaterial, e);
              }}
              className="gap-2"
            >
              <Download className="h-4 w-4" /> Download
            </Button>
            <Button variant="outline" onClick={() => setPreviewVisible(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
