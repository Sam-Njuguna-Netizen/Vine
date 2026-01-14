"use client";

import React, { useState, useEffect } from "react";
import CourseShowCard from "../components/CourseShowCard";
import { useSelector } from "react-redux";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import StudentDashboard from "./components/student-dashboard";
import InstructorDashboard from "./components/InstructorDashboard";
import moment from "moment";

export default function DashboardClient({
    serverUser,
    serverContinueLearning,
    serverCourses,
    serverStudentData,
    serverInstructorData
}) {
    const reduxUser = useSelector((state) => state?.auth?.user);

    // Prefer serverUser for initial render, fall back to reduxUser for updates
    // or logic that relies on client-side consistency.
    // Actually, mixing them is tricky. Let's rely on serverUser for layout decisions initially?
    // But reduxUser might have more latest "token" details? 
    // Usually serverUser is fresh from DB on page load.
    const user = serverUser || reduxUser;

    const [courseCategory, setCourseCategory] = useState(serverCourses || []);
    const [continueLearning, setContinueLearning] = useState(serverContinueLearning || null);

    const apiUrl = useSelector((state) => state.commonGLobal.apiUrl);
    const { darkMode } = useTheme();

    // If we have serverUser, we aren't "loading" in the traditional sense, 
    // but if we rely on Redux user, we might be. 
    // If serverUser is null (guest), we might redirect? 
    // The original code had a commented out redirect.
    // We'll assume if we are on this page, and serverUser is present, we render.

    if (!user) {
        // If SSR didn't find user, and Redux hasn't loaded yet... 
        // maybe return loading or null.
        // But page.jsx (server) will redirect if no token?
        // We'll see.
        return null;
    }

    const hasActiveSubscription = (user?.expiryDate && moment(user?.expiryDate).isAfter(moment()));

    return (
        <div
            className={`min-h-screen sm:p-2 p-0 ${darkMode ? " " : " text-gray-800"}`}
        >
            <div className="px-0 sm:px-6 py-8">
                {/* Continue Learning Section */}
                {user?.roleId === 3 && continueLearning && continueLearning.course && (
                    <div className={`rounded-lg p-6 mb-8 shadow-md transition-colors duration-300 border-l-4 border-indigo-500 ${darkMode ? "bg-black" : "bg-white"}`}>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold mb-1 dark:text-white flex items-center gap-2">
                                    <span>Resume Learning</span>
                                </h2>
                                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                    Pick up where you left off in <span className="font-semibold text-indigo-600 dark:text-indigo-400">{continueLearning.course.title}</span>
                                </p>
                            </div>
                            <Link
                                href={`/courses/${continueLearning.course.id}?contentId=${continueLearning.courseLectureContentId}`}
                                className="gradient-button text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-all hover:scale-105 flex items-center gap-2"
                            >
                                <span>Continue Course</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Subscription Banner */}
                {!hasActiveSubscription && (
                    <div
                        className={`rounded-lg p-6 mb-8 shadow-md transition-colors duration-300 ${darkMode ? "bg-gray-800" : "bg-blue-100"}`}
                    >
                        <h2 className="text-2xl font-bold mb-2 dark:text-white">
                            Want access to all courses?
                        </h2>
                        <p className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Enroll in our school to unlock all available courses. Choose a
                            monthly or yearly plan.
                        </p>
                        <Link
                            href="/setting#subscription"
                            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold sm:px-6 px-1 py-2 rounded-lg shadow-sm transition-transform transform hover:scale-105"
                        >
                            View Subscription Options
                        </Link>
                    </div>
                )}

                {/* Institution Banner */}
                {user?.institution && (
                    <div className={`rounded-[2em] p-6 mb-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 ${darkMode ? "bg-black border border-gray-800 " : "bg-white"}`}>
                        <div className="flex items-center gap-4">
                            {user.institution.logo && (
                                <img
                                    src={`${user.institution.logo}`}
                                    alt="Institution Logo"
                                    className="h-16 w-16 object-contain rounded-full border border-gray-200 bg-white"
                                />
                            )}
                            <div>
                                <h2 className="text-xl font-bold dark:text-white">
                                    {user.institution.name}
                                </h2>
                                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                    {user.institution.institutionAddress}
                                </p>
                            </div>
                        </div>
                        {user.institution.websiteLink && (
                            <a
                                href={user.institution.websiteLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="gradient-button text-white px-6 py-2 rounded-lg transition-colors duration-200"
                            >
                                Visit Website
                            </a>
                        )}
                    </div>
                )}

                {/* Student Dashboard */}
                {user?.roleId === 3 && (
                    <div>
                        {/* Pass server data if available */}
                        <StudentDashboard initialData={serverStudentData} />
                    </div>
                )}

                {/* Instructor Dashboard */}
                {user?.roleId === 2 && (
                    <div>
                        {/* Pass server data if available */}
                        <InstructorDashboard initialData={serverInstructorData} />
                    </div>
                )}

                {/* Course Categories (For non-student/non-instructor or public) */}
                {user?.roleId !== 3 && user?.roleId !== 2 &&
                    courseCategory?.map((category) => (
                        <div key={category.id} className="mb-12">
                            <h3
                                className={`text-4xl font-bold mb-6 pb-2 border-b-2 dark:text-white ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                            >
                                {category.name}
                            </h3>
                            <div className="relative">
                                <div className="px-0 sm:px-6 lg:px-8 py-6">
                                    {/* Paid Courses Section */}
                                    <div className="mb-8">
                                        <h2 className="text-2xl dark:text-white font-bold mb-4">
                                            Paid Courses
                                        </h2>
                                        <div className="flex overflow-x-auto space-x-5 pb-4">
                                            {category?.courses
                                                ?.filter((e) => parseFloat(e.salePrice) > 0.0)
                                                .map((course) => (
                                                    <div key={course.id} className="flex-shrink-0">
                                                        {apiUrl && (
                                                            <CourseShowCard course={course} apiUrl={apiUrl} />
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    <hr className="my-6 border-gray-200" />

                                    {/* Free Courses Section */}
                                    <div>
                                        <h2 className="text-2xl dark:text-white font-bold mb-4">
                                            Free Courses
                                        </h2>
                                        <div className="flex overflow-x-auto space-x-5 pb-4">
                                            {category?.courses
                                                ?.filter((e) => parseFloat(e.salePrice) <= 0.0)
                                                .map((course) => (
                                                    <div key={course.id}>
                                                        {apiUrl && (
                                                            <CourseShowCard course={course} apiUrl={apiUrl} />
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}
