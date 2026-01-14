"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import moment from "moment";
import { loadStripe } from "@stripe/stripe-js";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";

// Icons
import {
  BookOpen,
  BarChart,
  Tag,
  User,
  PlayCircle,
  ShoppingCart,
  Trash2,
  FileText,
  File,
  Loader2,
  Clock,
  CheckCircle2
} from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

const CourseOverview = ({ course, enrollButton = false }) => {
  const apiUrl = useSelector((state) => state.commonGLobal.apiUrl);
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  const [loading, setLoading] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);

  const authUser = useSelector((state) => state.auth.user);
  const router = useRouter();

  // --- Loading State ---
  if (!course) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#312E81]" />
        <p className="text-muted-foreground font-medium">Loading Course Details...</p>
      </div>
    );
  }

  // --- Actions ---
  const handleCheckout = async () => {
    setLoading(true);
    try {
      const stripe = await stripePromise;
      const res = await axios.post("/api/purchase-course", {
        courseId: course.id,
      });

      if (stripe && res.data.sessionId) {
        await stripe.redirectToCheckout({ sessionId: res.data.sessionId });
      } else {
        N.error("Could not initiate checkout.");
      }
    } catch (error) {
      N.error(error?.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/deleteCourse", course);
      if (response.data.success) {
        N.success("Course deleted successfully");
        router.push("/profile");
      } else {
        N.error(response.data.message || "Failed to delete course");
      }
    } catch (error) {
      N.error(error?.response?.data?.message || "An error occurred while deleting the course.");
    } finally {
      setLoading(false);
    }
  };

  const handleContentClick = (content) => {
    if (content.type === 'file') {
      window.open(content.url, '_blank');
    } else {
      setPreviewContent(content);
      setPreviewModalOpen(true);
    }
  };

  // --- Render Helpers ---
  const renderPrice = () => {
    if (course.pricingModel === "free") {
      return <h3 className="text-2xl font-bold text-green-600">Free</h3>;
    }
    return (
      <div className="flex items-baseline gap-3">
        <h3 className="text-3xl font-bold text-[#312E81]">${course.salePrice}</h3>
        <span className="text-lg text-muted-foreground line-through">${course.regularPrice}</span>
      </div>
    );
  };

  const renderPreviewContent = () => {
    if (!previewContent) return null;

    if (previewContent.type === 'video') {
      return (
        <video controls className="w-full rounded-lg border bg-black" autoPlay>
          <source src={previewContent.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (['desc', 'notes', 'captions'].includes(previewContent.type)) {
      return (
        <div className="p-6 bg-slate-50 rounded-lg border text-sm leading-relaxed text-slate-700">
          {previewContent.content_data || previewContent.url}
        </div>
      );
    }

    return <p>Content type not supported for preview.</p>;
  };

  const courseDetailsList = [
    { icon: BarChart, label: "Difficulty", value: course.difficultyLevel },
    {
      icon: Tag,
      label: "Tags",
      value: JSON.parse(course.tags || "[]").slice(0, 3).join(", ") // Simplified for display
    },
    { icon: Clock, label: "Last Updated", value: moment(course.updatedAt).format("MMMM YYYY") },
  ];

  // --- Main Render ---
  return (
    <div className="min-h-screen w-full bg-slate-50/50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: Main Content (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">

          {/* 1. Header & Image */}
          <div className="space-y-4">
            <Badge className="bg-[#312E81]/10 text-[#312E81] hover:bg-[#312E81]/20 border-none px-3 py-1">
              Course Overview
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              {course.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {course.description}
            </p>

            {course.featuredImage && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md mt-6">
                {/* Use standard img if Next Image is tricky with dynamic external URLs, otherwise keep Image */}
                <img
                  src={course.featuredImage}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* 2. About Section */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-[#312E81]">About this course</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-7">
                Dive deep into the world of <span className="font-semibold text-[#701A75]">{course.title}</span>.
                This course is designed to provide you with comprehensive knowledge and practical skills.
                {/* Add more description logic here if needed */}
              </p>
            </CardContent>
          </Card>

          {/* 3. Curriculum (Accordion) */}
          {course.sections && course.sections.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#701A75]" />
                Course Curriculum
              </h3>

              <Card className="border shadow-sm overflow-hidden">
                <Accordion type="single" collapsible className="w-full">
                  {course.sections.map((section) => (
                    <AccordionItem key={section.id} value={section.id} className="px-4">
                      <AccordionTrigger className="hover:no-underline hover:text-[#312E81]">
                        <span className="font-medium text-left">{section.title}</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-2 pb-3">
                          {section.lectures?.map((lecture, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                              <PlayCircle className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 space-y-2">
                                <p className="text-sm font-medium text-slate-800">{lecture.title}</p>

                                {/* Resources Badges */}
                                {lecture.content && lecture.content.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {lecture.content.map((c, cIdx) => {
                                      let Icon = File;
                                      let badgeStyle = "bg-slate-100 text-slate-600 hover:bg-slate-200";

                                      if (c.type === 'video') {
                                        Icon = PlayCircle;
                                        badgeStyle = "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200";
                                      } else if (c.type === 'file') {
                                        Icon = FileText;
                                        badgeStyle = "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200";
                                      } else if (c.type === 'notes') {
                                        Icon = BookOpen;
                                        badgeStyle = "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200";
                                      }

                                      return (
                                        <Badge
                                          key={cIdx}
                                          variant="outline"
                                          className={`cursor-pointer gap-1 pl-1 pr-2 py-0.5 font-normal transition-all ${badgeStyle}`}
                                          onClick={(e) => {
                                            e.stopPropagation(); // Prevent accordion toggle
                                            handleContentClick(c);
                                          }}
                                        >
                                          <Icon className="h-3 w-3" />
                                          {c.type.toUpperCase()}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">No content available</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </div>
          )}

          {/* 4. Intro Video */}
          {course.introVideo && (
            <div className="space-y-4 pt-4">
              <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-[#701A75]" />
                Course Introduction
              </h3>
              <div className="rounded-xl overflow-hidden shadow-lg border bg-black">
                <video controls className="w-full aspect-video">
                  <source src={course.introVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sidebar (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">

            {/* Action Card */}
            <Card className="shadow-lg border-t-4 border-t-[#312E81]">
              <CardContent className="p-6 space-y-6">
                <div className="text-center py-2 border-b border-dashed border-slate-200 pb-6">
                  {renderPrice()}
                </div>

                {enrollButton && authUser?.roleId === 3 && (
                  <>
                    {authUser?.expiryDate && moment(authUser.expiryDate).isAfter(moment()) ? (
                      <Button
                        size="lg"
                        className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md"
                        disabled
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Included with Subscription
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-[#312E81] to-[#701A75] hover:opacity-90 transition-opacity text-white shadow-md"
                        onClick={handleCheckout}
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                        Enroll Now
                      </Button>
                    )}
                  </>
                )}

                {/* Instructor Delete Action */}
                {course.instructorId === authUser?.id &&
                  course.instructorCall &&
                  authUser?.roleId === 2 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-none"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Course
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the course
                            "{course.title}" and remove it from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Yes, Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                <div className="space-y-4 pt-2">
                  {courseDetailsList.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-slate-500">
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </div>
                      <div className="font-medium text-slate-900 max-w-[150px] truncate text-right">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Instructor Profile Card */}
            {course.instructor?.profile && (
              <Card className="shadow-md">
                <CardHeader className="bg-slate-50 border-b pb-4">
                  <CardTitle className="text-base font-semibold text-center text-slate-700">Instructor</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-sm mb-3">
                    <AvatarImage src={course.instructor.profile.pPic} />
                    <AvatarFallback className="bg-[#312E81] text-white">
                      {course.instructor.profile.name?.charAt(0) || "I"}
                    </AvatarFallback>
                  </Avatar>

                  <Link href={"/profile/" + course.instructor.id} className="group">
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-[#701A75] transition-colors">
                      {course.instructor.profile.name}
                    </h4>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {course.instructor.profile.profession || "Educator"}
                  </p>

                  <Button variant="outline" size="sm" className="mt-4 w-full text-xs">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>

      {/* Content Preview Modal (Dialog) */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none text-white">
          {/* Added a close wrapper mostly for video context, standard DialogClose exists top right usually */}
          <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="text-slate-900 flex items-center gap-2">
                {previewContent?.type === 'video' ? <PlayCircle className="h-5 w-5 text-[#701A75]" /> : <FileText className="h-5 w-5 text-[#312E81]" />}
                {previewContent?.type?.toUpperCase() || "Preview"}
              </DialogTitle>
            </DialogHeader>
            <div className="p-0 bg-black">
              {renderPreviewContent()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseOverview;