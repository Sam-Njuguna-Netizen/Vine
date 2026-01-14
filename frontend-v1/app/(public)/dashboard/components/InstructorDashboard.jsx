"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Eye, CheckCircle, HelpCircle, Smartphone, Gamepad, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MyAllCourse } from "@/app/utils/courseService";
import Link from "next/link";

const InstructorDashboard = ({ initialData }) => {
  const user = useSelector((state) => state.auth.user);
  const [courses, setCourses] = useState(initialData || []);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    published: 0,
  });

  useEffect(() => {
    if (initialData) {
      calculateStats(initialData);
    } else {
      fetchCourses();
    }
  }, [initialData]);

  const calculateStats = (allCourses) => {
    const total = allCourses.length;
    const published = allCourses.filter(c => c.courseVisibility === 'Visible').length;
    const completed = allCourses.filter(c => c.sections && c.sections.length > 0).length;
    setStats({ total, published, completed });
  };

  const fetchCourses = async () => {
    const response = await MyAllCourse();
    if (response?.success) {
      const allCourses = response.courses;
      setCourses(allCourses);
      calculateStats(allCourses);
    }
  };

  const StatCard = ({ title, count, img, colorClass, iconBgClass }) => (
    <Card className="border-none shadow-sm bg-white dark:bg-gray-800 dark:text-white">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-md font-medium dark:text-white text-gray-500 mb-1">{title}</p>
          <h3 className="text-sm font-bold gradient-font">{count}</h3>
        </div>
        <div>
          <img src={img} className={`w-8 h-8 ${colorClass}`} />
        </div>
      </CardContent>
    </Card>
  );

  const RecentCourseCard = ({ course }) => (
    <Card className="border-none shadow-sm bg-white dark:bg-gray-800 dark:text-white hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="w-12 h-12 dark:bg-gray-600 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
          {/* Placeholder icon logic */}
          <Smartphone className="w-6 h-6 text-gray-600 dark:bg-gray-600 dark:text-white" />
        </div>
        <h4 className="font-semibold text-gray-900 mb-4 line-clamp-1 dark:text-white">{course.title}</h4>

        <div className="space-y-2">
          {/* Progress bar placeholder - Instructors don't usually have 'progress' in their own course 
              unless it's about course creation completion. 
              Using a static value or random for demo if real data isn't available. 
              Let's use a 'completeness' metric if possible, or just hide it if not relevant.
              The design shows progress, so I'll simulate 'Course Readiness' or similar.
          */}
          <div className="flex justify-between text-xs text-gray-500">
            {/* <span>Progress</span> */}
            {/* <span className="font-medium text-gray-900">75%</span> */}
            {/* Design shows "2/4" style text, maybe steps completed? */}
            <div className="w-full h-4 rounded-full bg-gray-100 overflow-hidden mt-2">
              <div className="h-full bg-gradient-to-r from-[#701A75] to-[#312E81] rounded-[1em] w-3/4"></div>
            </div>
            <div className="flex justify-end ml-2 mt-1">
              <span className="text-xs dark:text-white  text-gray-500">2/4</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl max-md:text-center text-black dark:text-white">Welcome Back {user?.profile?.name}</h1>
        <p className="text-gray-500 mt-1 max-md:text-center dark:text-white">Here overview of your course</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Courses"
          count={stats.total}
          img={'/assets/eye.png'}
          colorClass="text-indigo-600"
          iconBgClass="bg-indigo-50"
        />
        <StatCard
          title="Completed"
          count={stats.completed}
          img={'/assets/tick.png'}
          colorClass="text-indigo-600"
          iconBgClass="bg-indigo-50"
        />
        <StatCard
          title="Published"
          count={stats.published}
          img={'/assets/question.png'}
          colorClass="text-indigo-600"
          iconBgClass="bg-indigo-50"
        />
      </div>

      {/* Recent Courses Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Courses</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Courses List (Left 2 columns) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {courses.slice(0, 2).map(course => (
              <RecentCourseCard key={course.id} course={course} />
            ))}
            {courses.length === 0 && (
              <div className="col-span-2 text-center py-10 text-gray-500 bg-white rounded-lg">
                No courses found.
              </div>
            )}
          </div>

          {/* Recent Published (Right column) */}
          <Card className="border-none shadow-sm dark:bg-gray-800 dark:text-white  bg-white h-full">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Recent Published</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {courses.filter(c => c.courseVisibility === 'Visible').slice(0, 2).map(course => (
                <Link href={`/courses/${course.id}/play`} key={course.id} className="flex hover:bg-gray-50 p-2 rounded-[2em] items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Gamepad className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">{course.title}</p>
                    {/* <p className="text-xs text-gray-500">Ui/Ux</p> */}
                  </div>
                </Link>
              ))}
              {courses.filter(c => c.courseVisibility === 'Visible').length === 0 && (
                <p className="text-sm text-gray-500">No published courses yet.</p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
