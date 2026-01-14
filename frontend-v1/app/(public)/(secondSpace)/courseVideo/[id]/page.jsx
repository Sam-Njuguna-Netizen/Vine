"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Play,
  Trash2,
  ArrowLeft,
  Loader2,
  Video,
} from "lucide-react";

import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

// Import or define the modals from the previous step
import {
  AddVideoModal,
  VideoPlayerModal,
} from "../../../../Components/VideoModals";

const CourseVideosPage = () => {
  const params = useParams();
  const courseId = params.id;
  const authUser = useSelector((state) => state.auth.user);
  const [refreshVideos, setRefreshVideos] = useState(false);
  const [courseVideos, setCourseVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);

  useEffect(() => {
    if (courseId) {
      const getCourseVideos = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`/api/getCourseVideos/${courseId}`);
          // Sorting videos by serial number
          const sortedVideos = response.data.sort(
            (a, b) => a.serialNo - b.serialNo
          );
          setCourseVideos(sortedVideos);
        } catch (error) {
          N("Error", "Failed to fetch videos", "error");
          setCourseVideos([]);
        } finally {
          setIsLoading(false);
        }
      };
      getCourseVideos();
    }
  }, [courseId, refreshVideos]);

  const handleDelete = async (video) => {
    try {
      await axios.post("/api/deleteVideo", video);
      N("Success", "Video deleted successfully", "success");
      setCourseVideos((currentVideos) =>
        currentVideos.filter((v) => v.id !== video.id)
      );
      setRefreshVideos((prev) => !prev);
    } catch (error) {
      N("Error", "Failed to delete video.", "error");
    }
  };

  const handleSave = async (videoInfo) => {
    try {
      const response = await axios.post("/api/storeVideoInfo", videoInfo);
      N("Success", "Video added successfully", "success");
      setCourseVideos((currentVideos) =>
        [...currentVideos, response.data.video].sort(
          (a, b) => a.serialNo - b.serialNo
        )
      );
      setRefreshVideos((prev) => !prev);
      setAddModalOpen(false);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        "An unexpected error occurred.";
      N("Error", errorMessage, "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-indigo-600 h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="p-0 sm:p-8 min-h-screen">
      <div className="mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <Link
              href="/courses"
              className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 mb-2 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Courses
            </Link>
            <h1 className="text-3xl font-bold dark:text-white text-center sm:text-start">
              Course Videos
            </h1>
          </div>
          {authUser?.roleId === 2 && (
            <Button onClick={() => setAddModalOpen(true)} className="mt-4 sm:mt-0">
              <Plus size={20} className="mr-2" /> Add Video
            </Button>
          )}
        </div>

        {courseVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courseVideos.map((video) => (
              <Card
                key={video?.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="h-40 bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                  <Video className="text-gray-400" size={60} />
                </div>
                <CardContent className="p-4">
                  <h3
                    className="text-lg font-semibold text-gray-800 dark:text-white truncate"
                    title={video?.title}
                  >
                    {video?.serialNo}. {video?.title}
                  </h3>
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPlayingVideo(video)}
                      className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-0 h-auto font-medium"
                    >
                      <Play size={16} className="mr-1" /> Play
                    </Button>

                    {authUser?.roleId === 2 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8">
                            <Trash2 size={18} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Video?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{video.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(video)} className="bg-red-600 hover:bg-red-700">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
              No Videos Here Yet
            </h2>
            <p className="text-gray-500 mt-2">
              {authUser?.roleId === 2
                ? "Click 'Add Video' to get started."
                : "Content is coming soon!"}
            </p>
          </div>
        )}
      </div>

      <AddVideoModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSave}
        courseId={courseId}
      />

      <VideoPlayerModal
        isOpen={!!playingVideo}
        onClose={() => setPlayingVideo(null)}
        videoUrl={playingVideo ? `${playingVideo?.path}` : ""}
        title={playingVideo ? playingVideo?.title : ""}
      />
    </div>
  );
};

export default CourseVideosPage;
