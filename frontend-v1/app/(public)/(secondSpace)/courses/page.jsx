"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Clock,
  FileText,
  CheckCircle,
  Plus,
  LoaderCircle,
  Search,
  MoreHorizontal,
  PlayCircle,
  BookOpen,
  Users,
  Star,
  Edit
} from "lucide-react";
import { getStudentCourseProgress, getPopularCourses, getAllPublicCourses, MyAllCourse, enrollFreeCourse } from "@/app/utils/courseService";
import { toast } from "sonner";
import CheckoutModal from "@/app/(public)/components/CheckoutModal";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // Import ScrollArea if available, or fallback to div with overflow

const CoursesPage = () => {
  const authUser = useSelector((state) => state.auth.user);
  const router = useRouter();

  const [progressData, setProgressData] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states for Enrolled Courses
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  // State for Checkout
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutCourse, setCheckoutCourse] = useState(null);

  const handleJoinCourse = async (course) => {
    // Check if user has an active subscription
    const hasActiveSubscription = authUser?.expiryDate && new Date(authUser.expiryDate) > new Date();

    if (course.pricingModel === "Free" || parseFloat(course.salePrice || 0) <= 0 || hasActiveSubscription) {
      try {
        const response = await enrollFreeCourse(course.id);
        if (response.success) {
          toast.success(response.message || "Enrolled successfully!");
          // Refresh data or redirect
          router.push(`/courses/${course.id}/play`);
        } else {
          toast.info(response.message || "Failed to enroll.");
        }
      } catch (error) {
        toast.error("An error occurred during enrollment.");
      }
    } else {
      // Paid course -> Open Checkout
      setCheckoutCourse(course);
      setIsCheckoutOpen(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (authUser) {
          if (authUser.roleId === 2) {
            // Instructor: Fetch created courses
            const myCoursesRes = await MyAllCourse();
            if (myCoursesRes.success) {
              setInstructorCourses(myCoursesRes.courses);
            }
          } else {
            // Student: Fetch progress and popular courses
            const progressRes = await getStudentCourseProgress(searchQuery);
            if (progressRes.success) {
              setProgressData(progressRes.data);
            }

            const popularRes = await getPopularCourses();
            if (popularRes.success) {
              setPopularCourses(popularRes.courses);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search only for students
    if (authUser?.roleId !== 2) {
      const timeoutId = setTimeout(() => {
        fetchData();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      fetchData();
    }
  }, [authUser, searchQuery]);

  // Filter enrolled courses (Student only)
  const filteredEnrolledCourses = progressData.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-950">
        <LoaderCircle className="animate-spin text-indigo-600 dark:text-indigo-400" size={48} />
      </div>
    );
  }

  // --- INSTRUCTOR VIEW ---
  if (authUser?.roleId === 2) {
    return (
      <div className="min-h-screen p-6 max-md:p-0 font-sans text-slate-900 dark:text-slate-50">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex justify-between items-center max-md:flex-col max-md:gap-4">
            <div className="">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 gradient-font">Instructor Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Manage, create and track your courses.</p>
            </div>
            <div>
              <Link href="/createCourse">
                <Button className="gradient-button rounded-full">
                  <Plus className="w-4 h-4 mr-2" /> Create Course
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Published Section */}
          <section className="bg-gray-100 max-md:p-0 max-md:m-0 dark:bg-transparent rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
            <h2 className="text-xl font-bold max-md:text-center text-slate-900 dark:text-slate-50 mb-4">Recent Published</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {instructorCourses.length > 0 ? (
                instructorCourses.slice(0, 2).map((course) => (
                  <div key={course.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-slate-800">
                    <div className="h-24 w-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {course.featuredImage ? (
                        <img src={course.featuredImage} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <BookOpen size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-50 truncate" title={course.title}>
                        {course.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock size={16} />
                          <span>{course.duration || "2:30hr"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileText size={16} />
                          <span>{course.sections?.reduce((acc, sec) => acc + (sec.lectures?.length || 0), 0) || 12} Lesson</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-500 font-medium">
                          <CheckCircle size={16} />
                          <span>Published</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 dark:text-slate-400 text-sm">No recently published courses.</div>
              )}
            </div>
          </section>

          {/* My Created Courses Grid */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">My Created Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {instructorCourses.length > 0 ? (
                instructorCourses.map((course) => (
                  <Card key={course.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900 overflow-hidden flex flex-col h-full rounded-[2em]">
                    <div className="h-48 bg-slate-100 dark:bg-slate-800 relative group">
                      {course.featuredImage ? (
                        <img src={course.featuredImage} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <BookOpen size={32} />
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-50 hover:bg-white dark:hover:bg-slate-900">
                        {course.courseVisibility}
                      </Badge>

                      {/* Overlay Edit Button */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <Link href={`/createCourse?courseId=${course.id}`}>
                          <Button variant="secondary" className="rounded-full shadow-lg font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            <Edit size={16} className="mr-2" /> Edit Course
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-slate-50 mb-2 line-clamp-2" title={course.title}>{course.title}</h3>

                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Users size={16} />
                          <span>{course.enroles?.length || 0} Students</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-orange-400" />
                          <span>
                            {course.rating?.length > 0
                              ? (course.rating.reduce((a, b) => a + b.rating, 0) / course.rating.length).toFixed(1)
                              : "0.0"}
                          </span>
                        </div>
                      </div>

                      {/* Course Footer */}
                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-50 text-lg">
                            {course.pricingModel === "Free" ? "Free" : `$${course.salePrice}`}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/createCourse?courseId=${course.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600" title="Edit Course">
                              <Edit size={16} />
                            </Button>
                          </Link>
                          <Link href={`/courses/${course.id}/play`}>
                            <Button variant="outline" size="sm" className="font-semibold h-8 text-xs">
                              Preview
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-slate-400 dark:text-slate-500">
                  You haven't created any courses yet.
                  <div className="mt-4">
                    <Link href="/createCourse">
                      <Button variant="outline">Create Your First Course</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // --- STUDENT VIEW ---
  return (
    <div className="min-h-screen p-0 md:p-6 font-sans text-slate-900 dark:text-slate-50">
      <div className=" mx-auto  space-y-12">


        {/* Section 1: My Course Progress */}
        <div className="bg-white dark:bg-gray-900 p-2 max-md:p-0 sm:p-6 rounded-[2em]">
          {progressData.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">My Course Progress</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Track All Your Ongoing & Completed Courses</p>
                </div>

              </div>

              <div className="space-y-4 w-full max-md:mx-0">
                {progressData.slice(0, 3).map((course) => (
                  <Card key={course.id} className="overflow-hidden min-w-full max-md:mx-0 max-md:px-0 max-md:rounded-none bg-white dark:bg-black dark:text-white max-md:shadow-none transition-all  group">
                    <div className="flex flex-col w-full sm:flex-row">
                      {/* Course Image */}
                      <div className="w-full sm:w-48 h-48 sm:h-auto relative shrink-0">
                        {course.featuredImage ? (
                          <img
                            src={course.featuredImage}
                            alt={course.title}
                            className="w-full border border-gray-200 rounded-t-[2em] max-md:rounded-none max-md:rounded-t-none sm:rounded-l-[2em] sm:rounded-tr-none h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-t-[2em] max-md:rounded-none max-md:rounded-t-none sm:rounded-l-[2em] sm:rounded-tr-none">
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
                              <Link href={`/courses/${course.id}/play`}>
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
                          <p className="text-sm text-muted-foreground py-3">{course.description || "No description available."}</p>
                        </div>
                        <div className="space-y-2">

                          <Progress value={course.progress} className="h-2 " />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-4 flex justify-start">
                <Link href="/my-learning">
                  <Button variant="link" className="text-indigo-600 dark:text-indigo-400 font-semibold p-0 h-auto">View All &gt;</Button>
                </Link>
              </div>
            </section>
          )}
        </div>
        {/* Section 2: Enrolled Course */}
        <div className="bg-white dark:bg-gray-900 p-0 sm:p-6 rounded-[2em] max-md:rounded-none">

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-6">Enrolled Course</h2>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  placeholder="e.g, React, John Doe"
                  className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:text-slate-50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:text-slate-50">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {/* Add dynamic categories if available */}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:text-slate-50">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* List */}
            <div className="space-y-4">
              {filteredEnrolledCourses.length > 0 ? (
                filteredEnrolledCourses.map(course => (
                  <Card key={course.id} className="overflow-hidden min-w-full  bg-white dark:bg-black dark:text-white shadow-none transition-all  group">
                    <div className="flex flex-col w-full sm:flex-row">
                      {/* Course Image */}
                      <div className="w-full sm:w-48 h-48 sm:h-auto relative shrink-0">
                        {course.featuredImage ? (
                          <img
                            src={course.featuredImage}
                            alt={course.title}
                            className="w-full border border-gray-200 rounded-t-[2em] sm:rounded-l-[2em] sm:rounded-tr-none h-full object-cover"
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
                              <Link href={`/courses/${course.id}/play`}>
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
                          <p className="text-sm text-muted-foreground py-3">{course.description?.slice(0, 100) + "..." || "No description available."}</p>
                        </div>
                        <div className="space-y-2">

                          <Progress value={course.progress} className="h-2 " />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  No enrolled courses found matching your filters.
                </div>
              )}
            </div>

            {filteredEnrolledCourses.length > 5 && (
              <div className="mt-6">
                <Link href="/my-learning">
                  <Button variant="link" className="text-indigo-600 dark:text-indigo-400 font-bold p-0">View All &gt;</Button>
                </Link>
              </div>
            )}
          </section>
        </div>
        {/* Section 3: Popular Course */}
        <div className="bg-white dark:bg-gray-900 p-0 sm:p-6 rounded-[2em]">

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Popular Course</h2>
              <Link href="/courses/browse">
                <Button variant="outline" size="sm" className="dark:text-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Show All Courses</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularCourses.slice(0, 4).map(course => (
                <Card key={course.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900 overflow-hidden flex flex-col h-full rounded-[2em]">
                  <div className="h-40 bg-slate-100 dark:bg-slate-800 relative">
                    {course.featuredImage ? (
                      <img src={course.featuredImage} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <BookOpen size={32} />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50 mb-1 line-clamp-2" title={course.title}>{course.title}</h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">{course.students || 0} students</div>
                    <div className="flex items-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-xs ${star <= Math.round(course.avgRating || 0) ? 'text-orange-400' : 'text-slate-200'}`}>★</span>
                      ))}
                      <span className="text-xs text-slate-400 ml-1">({course.avgRating ? parseFloat(course.avgRating).toFixed(1) : '0.0'})</span>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-50 text-lg">
                        {course.pricingModel === "Free" ? "Free" : `$${course.salePrice}`}
                      </span>
                      <Button
                        size="sm"
                        className="gradient-button text-white text-xs font-semibold"
                        onClick={() => handleJoinCourse(course)}
                      >
                        Join Now
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
        {/* Checkout Modal */}
        {checkoutCourse && (
          <CheckoutModal
            open={isCheckoutOpen}
            onCancel={() => {
              setIsCheckoutOpen(false);
              setCheckoutCourse(null);
            }}
            cartList={[{ course: checkoutCourse, quantity: 1, style: 'Digital' }]}
          />
        )}
      </div>
    </div>

  );
};

export default CoursesPage;
