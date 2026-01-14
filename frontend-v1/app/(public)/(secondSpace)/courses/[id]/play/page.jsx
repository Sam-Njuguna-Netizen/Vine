"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "@/app/api/axios";
import { markContentAsComplete } from "@/app/utils/courseService";
import { N } from "@/app/utils/notificationService";
import { Loader2, ArrowLeft, Menu, FolderIcon, PlayIcon, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CoursePlayerSidebar from "@/app/(public)/components/CoursePlayerSidebar";
import CourseLectureDetails from "@/app/(public)/components/CourseLectureDetails";
import AddCourseReview from "@/app/(public)/components/AddReview";
import ReactPlayer from 'react-player'
export default function CoursePlayerPage() {
    const { id } = useParams();
    const router = useRouter();
    // const searchParams = useSearchParams();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeContent, setActiveContent] = useState(null);
    const [activeLecture, setActiveLecture] = useState(null);
    const [progress, setProgress] = useState(0);
    const [totalLectures, setTotalLectures] = useState(0);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    useEffect(() => {
        if (id) {
            fetchCourse();
        }
    }, [id]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/courseInAccessPage/${id}`);
            if (res.data) {
                setCourse(res.data);
                calculateProgress(res.data.sections);
                setTotalLectures(res.data.sections.reduce((total, section) => total + section.lectures.length, 0));
                // Auto-select first content if none selected
                if (!activeContent && res.data.sections?.length > 0) {
                    const firstSection = res.data.sections[0];
                    if (firstSection.lectures?.length > 0) {
                        const firstLecture = firstSection.lectures[0];
                        if (firstLecture.content?.length > 0) {
                            setActiveContent(firstLecture.content[0]);
                            setActiveLecture(firstLecture);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching course:", error);
            // Handle error appropriately
        } finally {
            setLoading(false);
        }
    };

    const calculateProgress = (sections) => {
        if (!sections) return;
        let total = 0;
        let completed = 0;

        sections.forEach(section => {
            section.lectures?.forEach(lecture => {
                lecture.content?.forEach(content => {
                    total++;
                    if (content.progress && content.progress.length > 0 && content.progress[0].isCompleted) {
                        completed++;
                    }
                });
            });
        });

        setProgress(total === 0 ? 0 : Math.round((completed / total) * 100));
    };

    const handleContentSelect = (content, lecture) => {
        setActiveContent(content);
        setActiveLecture(lecture);
        // Logic to mark as complete or log access can be added here
    };

    const handleProgressUpdate = async (content) => {
        console.log("Marking content as complete:", content.id);

        const currentStatus = content.progress && content.progress.length > 0 ? content.progress[0].isCompleted : false;
        const newIsCompleted = !currentStatus;

        try {
            await markContentAsComplete(course.id, content.id, newIsCompleted);
        } catch (error) {
            console.error("Failed to update progress in backend:", error);
        }

        // Optimistic update
        setCourse(prevCourse => {
            if (!prevCourse) return prevCourse;

            const newSections = prevCourse.sections.map(section => ({
                ...section,
                lectures: section.lectures.map(lecture => ({
                    ...lecture,
                    content: lecture.content.map(c => {
                        if (c.id === content.id) {
                            // Create or update progress entry. Toggle completion status.
                            const currentStatus = c.progress && c.progress.length > 0 ? c.progress[0].isCompleted : false;
                            const newProgress = [{ isCompleted: !currentStatus }];
                            return { ...c, progress: newProgress };
                        }
                        return c;
                    })
                }))
            }));

            const newCourse = { ...prevCourse, sections: newSections };
            calculateProgress(newSections); // Recalculate overall progress
            return newCourse;
        });
    };

    const handleNextLecture = () => {
        if (!course || !activeContent) return;

        let foundCurrent = false;
        let nextContent = null;
        let nextLecture = null;

        for (const section of course.sections) {
            for (const lecture of section.lectures) {
                if (lecture.content) {
                    for (const content of lecture.content) {
                        if (foundCurrent) {
                            nextContent = content;
                            nextLecture = lecture;
                            break;
                        }
                        if (content.id === activeContent.id) {
                            foundCurrent = true;
                        }
                    }
                }
                if (nextContent) break;
            }
            if (nextContent) break;
        }

        if (nextContent) {
            handleContentSelect(nextContent, nextLecture);
        } else {
            N("Success", "You have completed the last lecture!", "success");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen w-full bg-slate-950">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
            </div>
        );
    }

    if (!course) return null;

    return (
        <div className="flex h-screen flex-col  overflow-hidden">
            {/* Header */}
            <header className="min-h-[5em] mb-4 bg-[#f5f7fa] dark:bg-[#1F1F1F] rounded-[2em] flex items-center justify-between px-4 shrink-0 z-20 transition-all 
    max-md:flex-col max-md:items-start max-md:gap-y-4 max-md:p-3 max-md:my-2 max-md:rounded-xl">

                {/* Top Section: Back Button + Title + Stats */}
                <div className="flex items-center gap-3 w-full">
                    <div
                        className="h-10 w-10 md:h-12 md:w-12 flex shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-black cursor-pointer transition-colors"
                        onClick={() => router.push('/dashboard')}
                    >
                        <ArrowLeft className="h-5 w-5 dark:text-white" />
                    </div>

                    <div className="flex flex-col gap-1 w-full overflow-hidden">
                        {/* Title: Now visible on mobile, but smaller */}
                        <h1 className="text-[#1F1F1F] dark:text-white font-medium truncate w-full text-sm md:text-base">
                            {course.title}
                        </h1>

                        {/* Stats Row */}
                        <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
                            <div className="flex items-center gap-1.5">
                                <FolderIcon className="text-[#e6d8bb] h-3 w-3 md:h-4 md:w-4" />
                                <span className="text-xs md:text-sm text-muted-foreground">
                                    {course?.sections?.length} sections
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <PlayIcon className="text-[#564ffd] h-3 w-3 md:h-4 md:w-4" />
                                <span className="text-xs md:text-sm text-muted-foreground">
                                    {totalLectures} Lectures
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="text-[#fc9b3a] h-3 w-3 md:h-4 md:w-4" />
                                <span className="text-xs md:text-sm text-muted-foreground">
                                    {course?.duration}h
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Action Buttons */}
                <div className="flex items-center gap-2 w-full justify-between md:w-auto md:justify-end">
                    <div className="flex gap-2 w-full md:w-auto">
                        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="bg-white text-[#d3b16b] border-none shadow-sm dark:bg-black dark:text-white flex-1 md:flex-none h-9 text-xs md:text-sm"
                                >
                                    Write Review
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg p-0 border-0 bg-transparent shadow-none">
                                <AddCourseReview
                                    courseId={id}
                                    onReviewAdded={() => setIsReviewOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>

                        <Button
                            onClick={handleNextLecture}
                            className="gradient-button flex-1 md:flex-none h-9 text-xs md:text-sm"
                        >
                            Next Lecture
                        </Button>
                    </div>

                    {/* Sidebar Trigger (Mobile Only) */}
                    <div className="lg:hidden ml-2">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="p-0 w-80">
                                <CoursePlayerSidebar
                                    sections={course.sections}
                                    activeContent={activeContent}
                                    onContentSelect={handleContentSelect}
                                    onProgressUpdate={handleProgressUpdate}
                                    progress={progress}
                                />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-y-auto ">
                    {/* Video Player / Content Viewer */}
                    <div className=" w-full aspect-video max-h-[80vh] flex items-center justify-center relative  bg-[#141414] dark:bg-[#1F1F1F]">
                        {activeContent ? (
                            activeContent.type === 'video' ? (
                                activeContent.url ? (
                                    <ReactPlayer
                                        key={activeContent.id}
                                        controls
                                        width={1000}
                                        height={400}
                                        className="auto"
                                        autoPlay
                                        controlsList="nodownload"
                                        src={activeContent.url}
                                    />
                                ) : (
                                    <div className="text-white">Video unavailable</div>
                                )
                            ) : (
                                <div className="w-full h-full bg-transparent text-black dark:text-white dark:bg-[#1F1F1F] overflow-y-auto p-8">
                                    {['desc', 'notes'].includes(activeContent.type) && (
                                        <div className="prose prose-invert max-w-none">
                                            <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4">
                                                {activeContent.type === 'desc' ? 'Description' : 'Notes'}
                                            </h2>
                                            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                                {(() => {
                                                    let data = activeContent.contentData;
                                                    if (typeof data === 'object' && data !== null) {
                                                        data = data.text || JSON.stringify(data);
                                                    }
                                                    return data || activeContent.url || "No content available.";
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    {activeContent.type === 'file' && (
                                        <div className="w-full h-full flex flex-col">
                                            {activeContent.url && (activeContent.url.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx)$/i) || activeContent.url.match(/\.(jpeg|jpg|gif|png)$/i)) ? (
                                                <div className="flex-1 flex flex-col h-full">
                                                    <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between shrink-0">
                                                        <h3 className="text-white font-medium truncate max-w-md max-md:text-">
                                                            {activeContent.title || "File Preview"}
                                                        </h3>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => window.open(activeContent.url, '_blank')}
                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                                        >
                                                            Download Original
                                                        </Button>
                                                    </div>
                                                    {activeContent.url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                                        <div className="flex-1 bg-black flex items-center justify-center overflow-auto p-4">
                                                            <img
                                                                src={activeContent.url}
                                                                alt={activeContent.title || "Preview"}
                                                                className="max-w-full max-h-full object-contain"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <iframe
                                                            src={`https://docs.google.com/gview?url=${encodeURIComponent(activeContent.url)}&embedded=true`}
                                                            className="w-full flex-1 bg-white border-none"
                                                            title="File Preview"
                                                        />
                                                    )}

                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full p-8">
                                                    <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center max-w-md">
                                                        <h3 className="text-xl font-semibold text-white mb-2">
                                                            {activeContent.title || "Attached File"}
                                                        </h3>
                                                        <p className="text-slate-400 mb-6">
                                                            This file cannot be previewed directly in the player.
                                                        </p>
                                                        <Button
                                                            onClick={() => window.open(activeContent.url, '_blank')}
                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
                                                        >
                                                            Download / View File
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        ) : (
                            <div className="text-white">Select content to start learning</div>
                        )}
                    </div>

                    {/* Content Details & Tabs */}
                    <div className="flex-1 container mx-auto px-4 max-md:px-0 py-8 max-w-5xl">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                {activeLecture?.title || "Course Introduction"}
                            </h2>
                            {activeContent && (
                                <p className="text-slate-500 dark:text-slate-400">
                                    {activeContent.type === 'video' ? 'Video Lecture' : activeContent.type}
                                </p>
                            )}
                        </div>

                        <CourseLectureDetails
                            course={course}
                            activeLecture={activeLecture}
                            activeContent={activeContent}
                        />
                    </div>
                </div>

                {/* Sidebar (Desktop) */}
                <div className="hidden lg:block mx-5 w-96 shrink-0 h-full  border-gray-200  z-10">
                    <CoursePlayerSidebar
                        sections={course.sections}
                        activeContent={activeContent}
                        onContentSelect={handleContentSelect}
                        onProgressUpdate={handleProgressUpdate}
                        progress={progress}
                    />
                </div>
            </div>
        </div>
    );
}