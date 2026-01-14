"use client";
import { useState, useEffect } from "react";
import moment from "moment";
import { useTheme } from "@/context/ThemeContext";
import { useRouter, usePathname } from "next/navigation";
import { MyAllCourse } from "@/app/utils/courseService";
import { N } from "@/app/utils/notificationService";
import { Loader2 } from "lucide-react";
import StarRating from "@/app/Components/StarRating";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const defaultAvatar = '/';

const CoursesSection = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getAllCourses = async () => {
      try {
        setLoading(true);
        const response = await MyAllCourse();
        setCourses(response.courses);
      } catch (error) {
        N("Error", "Failed to fetch courses", "error");
      } finally {
        setLoading(false);
      }
    };
    getAllCourses();
  }, []);

  const handleCourseClick = (id) => {
    const destination = `${pathname}/${id}`;
    router.push(destination);
  };

  function getAverageRating(ratings) {
    if (!ratings || ratings.length === 0) return 0;
    const totalRating = ratings.reduce(
      (sum, rating) => sum + parseFloat(rating.rating),
      0
    );
    return totalRating / ratings.length;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-0 sm:p-8 sm:pt-8 pt-5 h-fit">
      <div className="flex overflow-x-auto space-x-5 pb-4 no-scrollbar">
        {courses.length === 0 && (
          <div className="text-center w-full py-10 text-gray-500">
            No Courses Available
          </div>
        )}
        {courses.map((course) => (
          <div className="flex-shrink-0 sm:w-[300px] w-[210px]" key={course.id}>
            <Card
              className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-gray-200 dark:border-gray-700 max-md:rounded-none"
              onClick={() => handleCourseClick(course.id)}
            >
              <div className="relative w-full sm:h-[180px] h-[140px] overflow-hidden">
                <img
                  src={`${course.featuredImage}`}
                  alt={course.title || "Course Image"}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              <CardContent className="p-3">
                <div className="flex items-center space-x-2 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={course?.instructor?.profile?.pPic || defaultAvatar} />
                    <AvatarFallback>{course?.instructor?.profile?.name?.charAt(0) || "I"}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium truncate text-gray-700 dark:text-gray-200">
                    {course?.instructor?.profile?.name || "Unknown Instructor"}
                  </p>
                </div>

                <h3 className="text-base font-bold truncate mb-1 dark:text-white" title={course.title}>
                  {course.title || "Untitled"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 h-10">
                  {course.description || "No description available"}
                </p>

                <div className="flex items-center mb-3">
                  <StarRating
                    value={getAverageRating(course.rating)}
                    readonly
                    size="sm"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {getAverageRating(course.rating)?.toFixed(1) || "0.0"}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    ${parseFloat(course.salePrice || 0).toFixed(2)}
                  </span>
                  {course.regularPrice && (
                    <span className="text-sm line-through text-gray-400">
                      ${parseFloat(course.regularPrice).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs text-gray-400 text-right">
                  {moment(course.createdAt).fromNow()}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesSection;
