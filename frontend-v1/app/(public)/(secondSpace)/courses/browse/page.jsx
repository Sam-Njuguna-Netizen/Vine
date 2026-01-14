"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
    Search,
    BookOpen,
    LoaderCircle
} from "lucide-react";
import { getAvailableCourses, enrollFreeCourse } from "@/app/utils/courseService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import CheckoutModal from "@/app/(public)/components/CheckoutModal";
import { useRouter } from "next/navigation";

const BrowseCoursesPage = () => {
    const authUser = useSelector((state) => state.auth.user);
    const router = useRouter();
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

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
        const fetchCourses = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch ALL available courses
                const availableRes = await getAvailableCourses(searchQuery, true);

                // 2. Fetch MY joined courses to filter them out
                // We could optimize this by passing "excludeJoined" to backend if supported, 
                // but since we are doing client-side fix:
                // We need to know which IDs are joined. 
                // We'll try to fetch joined courses lightly or assume we have them in Redux?
                // Redux might not have them loaded. Let's fetch lightweight list or just full list.
                // Note: This adds a second network request.
                const myCoursesRes = await import("@/app/utils/courseService").then(mod => mod.getStudentCourseProgress());

                if (availableRes.success) {
                    let filteredCourses = Array.isArray(availableRes.courses) ? availableRes.courses : [];

                    if (myCoursesRes.success && Array.isArray(myCoursesRes.data)) {
                        // Use String conversion for reliable ID comparison
                        const joinedIds = new Set(myCoursesRes.data.map(c => String(c.id)));
                        filteredCourses = filteredCourses.filter(c => !joinedIds.has(String(c.id)));
                    }

                    setCourses(filteredCourses);
                }
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchCourses();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return (
        <div className="min-h-screen  p-6 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-200">
            <div className=" mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Browse Courses</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Explore new skills and advance your career.</p>
                    </div>
                    <div className="w-full md:w-72 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="Search courses..."
                            className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:ring-indigo-500 focus:border-indigo-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <LoaderCircle className="animate-spin text-indigo-600 dark:text-indigo-400" size={48} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {courses.length > 0 ? (
                            courses.map(course => (
                                <Card key={course.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900 overflow-hidden flex flex-col h-full">
                                    <div className="h-40 bg-slate-100 dark:bg-slate-800 relative">
                                        {course.featuredImage ? (
                                            <img src={course.featuredImage} alt={course.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                                                <BookOpen size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50 mb-1 line-clamp-2" title={course.title}>{course.title}</h3>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">{course.enroles?.length || 0} students</div>
                                        <div className="flex items-center gap-1 mb-4">
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const rating = course.rating?.reduce((acc, r) => acc + r.rating, 0) / (course.rating?.length || 1) || 0;
                                                return (
                                                    <span key={star} className={`text-xs ${star <= Math.round(rating) ? 'text-orange-400' : 'text-slate-200 dark:text-slate-700'}`}>★</span>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="font-bold text-slate-900 dark:text-slate-50 text-lg">
                                                {course.pricingModel === "Free" ? "Free" : `$${course.salePrice}`}
                                            </span>
                                            <Button
                                                size="sm"
                                                className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white text-xs font-semibold"
                                                onClick={() => handleJoinCourse(course)}
                                            >
                                                Join Now
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-slate-400 dark:text-slate-500">
                                No courses found matching your search.
                            </div>
                        )}
                    </div>
                )}
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

export default BrowseCoursesPage;
