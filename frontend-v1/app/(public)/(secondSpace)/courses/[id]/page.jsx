"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "@/app/api/axios";
import {
  Loader2,
  BookOpen,
  Layers,
  Video,
  FileText,
  Radio,
  ClipboardList,
  HelpCircle,
  MessageSquare,
  Star
} from "lucide-react";

// Shadcn UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Import your content components
import CourseVideos from "../../../(secondSpace)/courseVideo/[id]/page";
import CourseAssignments from "../../../(secondSpace)/courseAssignment/[id]/page";
import CourseQuizzes from "../../../(secondSpace)/courseQuiz/[id]/page";
import CourseDiscussion from "../../../(secondSpace)/courseDiscussion/[id]/page";
import CourseLiveClasses from "../../../(secondSpace)/courseLiveClass/[id]/page";
import CourseDocuments from "../../../(secondSpace)/courseDoc/[id]/page";
import CourseOverview from "../../../components/CourseOverview";
import CourseContent from "../../../components/CourseContent";
import CourseFeedbacks from "../../../(secondSpace)/courseRating/[id]/page";

export default function CourseAccess() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentId = searchParams.get("contentId");
  const [activeTab, setActiveTab] = useState("1");

  useEffect(() => {
    if (contentId) {
      setActiveTab("course-content");
    }
  }, [contentId]);

  useEffect(() => {
    if (id) {
      fetchCourse();
    } else {
      router.push("/courses");
    }
  }, [id]);

  async function fetchCourse() {
    try {
      setLoading(true);
      const res = await axios.get(`/api/courseInAccessPage/${id}`);
      if (res.data) {
        setCourse(res.data);
      } else {
        router.push("/courses");
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      if (error.response && error.response.status === 403) {
        router.push("/courses");
      } else {
        router.push("/courses");
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading || !course) {
    return (
      <div className="flex justify-center items-center h-[60vh] w-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#312E81]" />
          <p className="text-sm text-muted-foreground font-medium">Loading your learning experience...</p>
        </div>
      </div>
    );
  }

  // Define tabs with icons for a better UI look
  const tabItems = [
    { key: "1", label: "Overview", icon: BookOpen, component: <CourseOverview course={course} /> },
    { key: "course-content", label: "Content", icon: Layers, component: <CourseContent courseId={course.id} sections={course.sections} refreshCourse={fetchCourse} /> },
    { key: "2", label: "Videos", icon: Video, component: <CourseVideos params={{ id }} /> },
    { key: "3", label: "Docs", icon: FileText, component: <CourseDocuments params={{ id }} /> },
    { key: "4", label: "Live", icon: Radio, component: <CourseLiveClasses params={{ id }} /> },
    { key: "5", label: "Tasks", icon: ClipboardList, component: <CourseAssignments params={{ id }} /> },
    { key: "6", label: "Quiz", icon: HelpCircle, component: <CourseQuizzes params={{ id }} /> },
    { key: "7", label: "Discuss", icon: MessageSquare, component: <CourseDiscussion params={{ id }} /> },
    { key: "8", label: "Ratings", icon: Star, component: <CourseFeedbacks params={{ id }} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#312E81] to-[#701A75] rounded-md w-full bg-slate-50/50">
      {/* 1. Header Section with Gradient Background */}
      <div className="w-full  px-4 py-8 sm:px-8 sm:py-10 shadow-lg">
        <div className=" mx-auto">
          <div className="flex flex-col gap-4">
            <Badge className="w-fit bg-white/20 hover:bg-white/30 text-white border-none px-3 py-1">
              Course Access
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              {course.title}
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base max-w-3xl leading-relaxed opacity-90">
              {course.description}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className=" mx-auto px-2 sm:px-2 py-2 -mt-4 sm:-mt-8">
        <Card className="border-none shadow-xl  backdrop-blur-sm overflow-hidden rounded-xl">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">

              {/* Responsive Tabs Navigation */}
              <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
                <TabsList className="h-auto w-full justify-start overflow-x-auto flex-nowrap gap-2 bg-transparent p-3 sm:p-4 no-scrollbar">
                  {tabItems.map((item) => (
                    <TabsTrigger
                      key={item.key}
                      value={item.key}
                      className="
                        flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all
                        data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100
                        data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#312E81] data-[state=active]:to-[#701A75]
                        data-[state=active]:text-white data-[state=active]:shadow-md
                      "
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Tab Content Areas */}
              <div className="min-h-[500px] bg-white">
                {tabItems.map((item) => (
                  <TabsContent
                    key={item.key}
                    value={item.key}
                    className="m-0 p-4 sm:p-6 outline-none animate-in fade-in-50 duration-300 slide-in-from-bottom-2"
                  >
                    {item.component}
                  </TabsContent>
                ))}
              </div>

            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Custom CSS for hiding scrollbar in the tabs list while allowing scroll */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}