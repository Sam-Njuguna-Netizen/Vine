"use client";

import React, { useState, useEffect } from "react";
import axios from "@/app/api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    BookOpen,
    Trophy,
    ClipboardCheck,
    Clock,
    Calendar,
    MoreHorizontal,
    PlayCircle,
    CheckCircle2,
    PencilRuler,
    Code2,
    LayoutTemplate,
    Grid2X2
} from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
const getIcon = (title, type) => {
    const lowerTitle = title.toLowerCase();
    const lowerType = type.toLowerCase();

    if (lowerTitle.includes("logo") || lowerType.includes("brand")) return <PencilRuler className="w-5 h-5" />;
    if (lowerTitle.includes("code") || lowerTitle.includes("developer")) return <Code2 className="w-5 h-5" />;
    if (lowerTitle.includes("design")) return <LayoutTemplate className="w-5 h-5" />;
    if (lowerTitle.includes("data")) return <Grid2X2 className="w-5 h-5" />;

    return <PencilRuler className="w-5 h-5" />; // Default
};
const StudentDashboard = ({ initialData }) => {
    const [stats, setStats] = useState(initialData?.stats || null);
    const [progress, setProgress] = useState(initialData?.progress || []);
    const [deadlines, setDeadlines] = useState(initialData?.deadlines || []);
    const [loading, setLoading] = useState(!initialData);

    useEffect(() => {
        if (initialData) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [overviewRes, progressRes, deadlinesRes] = await Promise.all([
                    axios.get("/api/student/analytics/overview"),
                    axios.get("/api/student/analytics/course-progress"),
                    axios.get("/api/student/analytics/deadlines"),
                ]);

                setStats(overviewRes.data);
                setProgress(progressRes.data);
                setDeadlines(deadlinesRes.data);
            } catch (err) {
                console.error("Failed to fetch analytics data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [initialData]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }
    const groupedDeadlines = deadlines.reduce((groups, item) => {
        const dateStr = dayjs(item.deadline).format("D MMM YYYY");
        if (!groups[dateStr]) {
            groups[dateStr] = [];
        }
        groups[dateStr].push(item);
        return groups;
    }, {});
    return (
        <div className=" flex flex-col lg:flex-row gap-6">
            {/* Stats Row */}
            <div className="flex-1 space-y-6">


                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 dark:text-white">
                    <Card className="bg-white  dark:bg-card shadow-sm hover:shadow-md rounded-[2em] transition-shadow ">
                        <CardContent className=" p-6 flex justify-between items-center ">
                            <div>
                                <p className="text-xl font-bold dark:text-white mb-1">Courses <br /> Enrolled</p>
                                <h3 className="text-4xl font-bold gradient-font">
                                    {stats?.coursesEnrolled || 0}
                                </h3>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                <img src="/assets/book.png" alt="Book Icon" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-card shadow-sm hover:shadow-md rounded-[2em] transition-shadow">
                        <CardContent className="p-6 flex justify-between items-center">
                            <div>
                                <p className="text-xl font-bold dark:text-white mb-1">Average <br /> Quiz Score</p>
                                <h3 className="text-4xl font-bold gradient-font">
                                    {stats?.averageScore || 0}%
                                </h3>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                <img src="/assets/average.png" alt="Trophy Icon" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white  dark:bg-card shadow-sm hover:shadow-md rounded-[2em] transition-shadow">
                        <CardContent className="p-6 flex justify-between items-center">
                            <div>
                                <p className="text-xl font-bold dark:text-white mb-1">Assignments Submitted</p>
                                <h3 className="text-4xl font-bold gradient-font">
                                    {stats?.assignmentsSubmitted || 0}
                                </h3>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <img src="/assets/task.png" alt="Clipboard Icon" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 bg-white  gap-8 p-4 sm:p-8 rounded-[2em] border border-gray-100 dark:border-gray-800 dark:bg-card">
                    {/* Course Progress Section */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">My Course Progress</h2>
                                <p className="text-muted-foreground opacity-80 dark:opacity-100 text-sm mt-2">Track All Your Ongoing & Completed Courses</p>
                            </div>

                        </div>

                        <div className="space-y-4 w-full">
                            {progress.length > 0 ? (
                                progress.map((course) => (
                                    <Card key={course.id} className="overflow-hidden min-w-full  bg-white dark:bg-black dark:text-white shadow-none transition-all  group">
                                        <div className="flex flex-col w-full sm:flex-row">
                                            {/* Course Image */}
                                            <div className="w-full sm:w-48 h-48 sm:h-auto relative shrink-0">
                                                {course.featuredImage ? (
                                                    <img
                                                        src={course.featuredImage}
                                                        alt={course.title}
                                                        className="w-full border border-gray-200 max-h-[150px] rounded-t-[2em] sm:rounded-l-[2em] sm:rounded-tr-none h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-t-[2em] sm:rounded-l-[2em] sm:rounded-tr-none">
                                                        <BookOpen className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="w-full p-5 flex flex-col justify-between">
                                                <div className="flex justify-between items-start gap-4 ">
                                                    <div className="w-full ">
                                                        <div className="flex items-center gap-2 justify-between">
                                                            <div>
                                                                <h3 className="font-bold text-lg  max-md:text-md group-hover:text-primary transition-colors">
                                                                    {course.title}
                                                                </h3>
                                                                <div className="flex items-center gap-4 w-full text-sm text-muted-foreground mb-3 max-md:hidden">
                                                                    <div className="flex items-center gap-2 gradient-font">
                                                                        <img src="/assets/apple-Icon.png" alt="Apple icon" />
                                                                        <span>{course.instructorName}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1 gradient-font">
                                                                        <img src="/assets/pg-Icon.png" alt="PG icon" />
                                                                        <span>{course.progress === 100 ? "Completed" : "In Progress"}</span>
                                                                    </div>
                                                                    <div className="flex justify-between gradient-font text-xs font-medium">
                                                                        <img src="/assets/read-Icon.png" alt="Progress icon" className="w-4 h-4" />
                                                                        <span className="gradient-font">{course.progress}% Complete</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Link href={`/courses/${course.id}/play${course.lastContentId ? `?contentId=${course.lastContentId}` : ''}`}>
                                                                <Button
                                                                    className={cn(
                                                                        "shrink-0 gradient-button",
                                                                    )}
                                                                >
                                                                    {course.progress === 100 ? "View" : "Continue"}
                                                                </Button>
                                                            </Link>
                                                        </div>

                                                    </div>

                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground py-3">{course.description?.split(" ").slice(0, 15).join(" ")}...</p>
                                                </div>
                                                <div className="space-y-2">

                                                    <Progress value={course.progress} className="h-2 " />
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-white dark:bg-card rounded-lg border border-dashed">
                                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                    <h3 className="text-lg font-medium">No courses enrolled yet</h3>
                                    <p className="text-muted-foreground mb-4">Start your learning journey today!</p>
                                    <Link href="/courses">
                                        <Button>Browse Courses</Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {progress.length > 0 && (
                            <div className="text-center">
                                <Link href="/my-learning" className="text-primary font-medium hover:underline flex items-center justify-center gap-1">
                                    See All Progress Courses
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                            </div>
                        )}
                    </div>


                </div>
            </div>
            {/* Upcoming Deadlines Sidebar */}
            <div className="lg:col-span-1">
                <Card className="border-none shadow-sm rounded-[2em] bg-white dark:bg-card h-full">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Upcoming Deadlines</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        {Object.keys(groupedDeadlines).length > 0 ? (
                            <div className="space-y-8">
                                {Object.entries(groupedDeadlines).map(([date, items]) => (
                                    <div key={date}>
                                        {/* Date Header */}
                                        <h3 className="text-sm text-muted-foreground font-medium mb-4">
                                            {date}
                                        </h3>

                                        {/* Items for this date */}
                                        <div className="space-y-6">
                                            {items.map((item, index) => {
                                                const timeStr = dayjs(item.deadline).format("h:mm A");

                                                return (
                                                    <div key={index} className="flex items-center gap-4">
                                                        {/* Icon Box */}
                                                        <div className="flex-shrink-0">
                                                            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-800 dark:text-purple-300 border border-purple-100 dark:border-purple-800">
                                                                {getIcon(item.title, item.course || item.type)}
                                                            </div>
                                                        </div>

                                                        {/* Text Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {/* Using course or type as the 'Subtitle' (e.g. Logo Design for Industry) */}
                                                                {item.course || item.type}
                                                            </p>
                                                            <h4 className="text-sm font-bold text-foreground truncate">
                                                                {item.title}
                                                            </h4>
                                                        </div>

                                                        {/* Time */}
                                                        <div className="flex-shrink-0">
                                                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                                {timeStr}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p>No upcoming deadlines</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StudentDashboard;
