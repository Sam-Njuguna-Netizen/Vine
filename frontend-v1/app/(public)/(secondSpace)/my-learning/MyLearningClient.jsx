"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
    Clock,
    FileText,
    CheckCircle,
    LoaderCircle,
    Search,
    BookOpen
} from "lucide-react";
import { getStudentCourseProgress } from "@/app/utils/courseService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MyLearningClient = ({ initialCourses = [] }) => {
    // Validate initialCourses is an array
    const safeInitialCourses = Array.isArray(initialCourses) ? initialCourses : [];

    // Initialize with server data
    const [courses, setCourses] = useState(safeInitialCourses);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Fallback: If initialCourses is empty, try fetching client-side.
    // This handles cases where SSR failed (e.g. no cookie yet) but client has token.
    useEffect(() => {
        const fetchCourses = async () => {
            setIsLoading(true);
            try {
                const res = await getStudentCourseProgress(searchQuery);
                if (res.success && Array.isArray(res.data)) {
                    setCourses(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // If we have no courses initially, fetch immediately.
        if (safeInitialCourses.length === 0 && searchQuery.trim() === "") {
            fetchCourses();
            return;
        }

        // Standard debounce for search
        if (searchQuery.trim() !== "") {
            const timeoutId = setTimeout(() => {
                fetchCourses();
            }, 500);
            return () => clearTimeout(timeoutId);
        } else {
            // Reset to initial if search cleared (and initial wasn't empty)
            if (safeInitialCourses.length > 0) {
                setCourses(safeInitialCourses);
            }
        }
    }, [searchQuery, safeInitialCourses]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 max-md:p-0 font-sans text-slate-900 dark:text-slate-100 transition-colors">
            <div className="max-w-7xl mx-auto space-y-8 max-md:space-y-0">

                {/* Header Section - Add padding on mobile so it doesn't touch edges, usually headers need some breathing room even if content is full width. 
                    User asked: "Don't add padding or margin in x direction for small devices."
                    This likely implies the CARDS should be full width. The header might look weird if truly 0 padding.
                    I will use px-4 for header on mobile, but keeping the "page" 0.
                */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-md:p-4 max-md:pb-2">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Learning</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Access all your enrolled courses and track your progress.</p>
                    </div>
                    <div className="w-full md:w-72 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="Search my courses..."
                            className="pl-10 bg-white dark:bg-black border hover:border-purple-600 focus:border-purple-600 shadow-none dark:border-slate-800 dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <LoaderCircle className="animate-spin text-indigo-600" size={48} />
                    </div>
                ) : (
                    <div className="space-y-4 max-md:space-y-0">
                        {courses.length > 0 ? (
                            courses.map(course => (
                                <Card key={course.id} className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 overflow-hidden max-md:rounded-none max-md:border-x-0 max-md:border-b-1">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 max-md:p-4">
                                        <div className="w-full sm:w-32 h-32 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative max-md:rounded-md">
                                            {course.featuredImage ? (
                                                <img src={course.featuredImage} alt={course.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <BookOpen size={24} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-2">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{course.title}</h3>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    <Avatar className="w-5 h-5">
                                                        <AvatarImage src={course.instructorAvatar} />
                                                        <AvatarFallback>I</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">{course.instructorName}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {course.progress === 100 ? (
                                                        <CheckCircle size={16} className="text-purple-600" />
                                                    ) : (
                                                        <Clock size={16} className="text-indigo-600" />
                                                    )}
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">{course.progress === 100 ? "Complete" : "In Progress"}</span>
                                                </div>
                                                {course.progress === 100 && (
                                                    <div className="flex items-center gap-1.5 text-purple-600">
                                                        <FileText size={16} />
                                                        <span className="font-medium">Certificate</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-400 line-clamp-2 max-w-3xl">
                                                {course.description}
                                            </p>
                                        </div>

                                        <div className="shrink-0 self-start sm:self-center max-md:w-full">
                                            <Link href={`/courses/${course.id}/play${course.lastContentId ? `?contentId=${course.lastContentId}` : ''}`} className="max-md:w-full block">
                                                <Button className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold px-6 max-md:w-full">
                                                    {course.lastContentId ? "Resume" : "View"}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                No enrolled courses found matching your search.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyLearningClient;
