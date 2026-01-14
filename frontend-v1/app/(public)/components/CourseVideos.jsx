"use client";
import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Upload,
  MoreVertical,
  Play,
  Trash2,
  Video,
  X,
  FileVideo
} from "lucide-react";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import { checkObjectFields } from "@/app/utils/common";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DragDropFileUpload } from "@/app/Components/DragDropFileUpload";

const CourseVideos = ({ course }) => {
  const [courseVideos, setCourseVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (course?.id) {
      getCourseVideos();
    }
  }, [course?.id]);

  const getCourseVideos = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/getCourseVideos/${course.id}`);
      if (response.status === 200) {
        setCourseVideos(response.data);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      // N("Error", "Failed to fetch videos", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const [serialNo, setSerialNo] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [path, setVideo] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const resetForm = () => {
    setSerialNo("");
    setTitle("");
    setDescription("");
    setVideo("");
    setVideoFile(null);
    setVideoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const videoInfo = {
      title,
      description,
      serialNo,
      path,
      courseId: course.id,
    };

    const ch = checkObjectFields(videoInfo, ["description"]);

    if (!ch.success) {
      N("Error", ch.message, "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post("/api/storeVideoInfo", videoInfo);
      if (response && response.status === 201) {
        N("Success", response.data.message, "success");
        getCourseVideos();
        resetForm();
      }
    } catch (error) {
      if (error?.response?.data?.errors?.length) {
        N("Error", error.response.data.errors[0].message, "error");
      } else {
        N("Error", error?.response?.data?.message || "Upload failed", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await axios.post("/api/upload-video", formData);
      if (response && response.status === 201) {
        N("Success", response.data.message, "success");
        setVideo(response.data.publicUrl);
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      N("Error", "Video upload failed", "error");
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setVideo("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const [videoUrl, setVideoUrl] = useState(null);
  const [videoModelTitle, setVideoModelTitle] = useState("");
  const [videoModelOpen, setVideoModelOpen] = useState(false);

  const handleVideoPlay = async (vdo) => {
    try {
      videoModelOnClose();

      // If we already have a direct URL (from upload), use it? 
      // The original code fetches a blob. Let's stick to that if it's how the backend works.
      // But if vdo.path is a public URL, we might not need the blob fetch.
      // Assuming the original logic is required for secure playback or specific backend handling.

      const response = await axios.get(`/api/playVideo/${vdo.id}`, {
        responseType: "blob",
      });

      if (response.data instanceof Blob) {
        const newVideoUrl = URL.createObjectURL(response.data);
        setVideoModelTitle(vdo.title);
        setVideoUrl(newVideoUrl);
        setVideoModelOpen(true);
      }
    } catch (error) {
      console.error("Error streaming video:", error);
      N("Error", "Failed to play video", "error");
    }
  };

  const videoModelOnClose = () => {
    setVideoModelOpen(false);
    setVideoModelTitle("");
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
  };

  const handleDelete = async (vdo) => {
    try {
      const response = await axios.post("/api/deleteVideo", vdo);
      if (response.status === 200) {
        N("Success", response.data.message, "success");
        getCourseVideos();
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      N("Error", "Failed to delete video", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            Course Videos
          </h3>
          <p className="text-sm text-muted-foreground">
            Watch and manage course video content.
          </p>
        </div>
        {course.instructorCall && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Video
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : courseVideos.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/50">
          <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">No videos yet</h3>
          <p className="text-muted-foreground mb-4">
            Upload videos to share with your students.
          </p>
          {course.instructorCall && (
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              Upload First Video
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courseVideos.map((vdo) => (
            <Card key={vdo.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200 dark:bg-card overflow-hidden">
              <div
                className="relative h-48 bg-slate-900 group cursor-pointer"
                onClick={() => handleVideoPlay(vdo)}
              >
                {/* Thumbnail placeholder - could be replaced with actual thumbnail if available */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 text-white fill-white" />
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  {course.instructorCall && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Video?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{vdo.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(vdo)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                  #{vdo.serialNo}
                </div>
              </div>

              <CardHeader className="pb-2 pt-4">
                <CardTitle className="line-clamp-1 text-lg" title={vdo.title}>
                  {vdo.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {vdo.description || "No description provided."}
                </p>
              </CardContent>
              <CardFooter className="pt-2 pb-4">
                <Button
                  variant="secondary"
                  className="w-full group"
                  onClick={() => handleVideoPlay(vdo)}
                >
                  <Play className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
                  Watch Video
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload New Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="serialNo">Serial No*</Label>
              <Input
                id="serialNo"
                type="number"
                placeholder="e.g. 1"
                value={serialNo}
                onChange={(e) => setSerialNo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title*</Label>
              <Input
                id="title"
                placeholder="Video Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the video..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Video File*</Label>
              <Label>Video File*</Label>
              <DragDropFileUpload
                onFileSelect={(file) => handleVideoUpload({ target: { files: [file] } })}
                selectedFile={videoFile || (path ? { name: "Current Video", previewUrl: path } : null)}
                label="Click or Drag Upload Video"
                accept="video/*"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting || !path}>
              {isSubmitting ? "Uploading..." : "Save Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Player Modal */}
      <Dialog open={videoModelOpen} onOpenChange={videoModelOnClose}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black border-slate-800">
          <DialogHeader className="p-4 bg-background/90 backdrop-blur absolute top-0 left-0 right-0 z-10 border-b border-white/10">
            <DialogTitle className="text-white flex items-center gap-2">
              <FileVideo className="h-5 w-5" />
              {videoModelTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full bg-black flex items-center justify-center pt-[60px]">
            {videoUrl && (
              <video
                controls
                className="w-full h-full"
                controlsList="nodownload"
                autoPlay
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseVideos;
