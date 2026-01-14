"use client";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, Filter, X } from "lucide-react";
import Link from "next/link";
import { MyAllCourse } from "@/app/utils/courseService";
import { N } from "@/app/utils/notificationService";
import { deleteFile } from "@/app/utils/common";
import axios from "@/app/api/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";

export default function CourseManage() {
  const isMobile = useSelector((state) => state.commonGLobal.isMobile);
  const authUser = useSelector((state) => state.auth.user);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    title: "",
    instructor: "",
    difficultyLevel: "",
  });

  useEffect(() => {
    getAllCourses();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [filters, courses]);

  const getAllCourses = async () => {
    setLoading(true);
    const response = await MyAllCourse();
    if (response?.success) {
      const formattedCourses = response.courses.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        difficultyLevel: course.difficultyLevel,
        pricingModel: course.pricingModel,
        regularPrice: course.regularPrice,
        salePrice: course.salePrice,
        courseVisibility: course.courseVisibility,
        featuredImage: course.featuredImage,
        introVideo: course.introVideo,
        tags: course.tags,
        instructor: course.instructor.profile?.name || "Unknown",
        enroles: course.enroles.length,
      }));
      setCourses(formattedCourses);
      setFilteredCourses(formattedCourses);
    }
    setLoading(false);
  };

  const handleFilter = () => {
    const filtered = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(filters.title.toLowerCase()) &&
        course.instructor.toLowerCase().includes(filters.instructor.toLowerCase()) &&
        course.difficultyLevel.toLowerCase().includes(filters.difficultyLevel.toLowerCase())
    );
    setFilteredCourses(filtered);
  };

  const handleResetFilter = () => {
    setFilters({
      title: "",
      instructor: "",
      difficultyLevel: "",
    });
  };

  const handleDelete = async (doc) => {
    try {
      const videoResponse = await axios.post("/api/deleteCourse", doc);
      if (videoResponse.status === 200 && !videoResponse.data.success) {
        N("Error", videoResponse.data.message, "error");
      } else if (videoResponse.status === 200) {
        N("Success", videoResponse.data.message, "success");
        if (doc.featuredImage) deleteFile(doc.featuredImage);
        if (doc.introVideo) deleteFile(doc.introVideo);
        getAllCourses();
      } else {
        N("Error", "Failed to delete course", "error");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      N("Error", "An error occurred while deleting the course", "error");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Course Management</h1>
          <p className="text-muted-foreground">Manage your courses and content.</p>
        </div>
        {authUser?.roleId === 2 && (
          <Link href="/createCourse">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Course
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-card rounded-lg border p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Title"
              value={filters.title}
              onChange={(e) => setFilters({ ...filters, title: e.target.value })}
              className="pl-8"
            />
          </div>
          <Input
            placeholder="Search by Instructor"
            value={filters.instructor}
            onChange={(e) => setFilters({ ...filters, instructor: e.target.value })}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Search by Level"
              value={filters.difficultyLevel}
              onChange={(e) => setFilters({ ...filters, difficultyLevel: e.target.value })}
              className="flex-1"
            />
            <Button variant="outline" onClick={handleResetFilter} size="icon" title="Reset Filters">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">No courses found matching your filters.</p>
          <Button variant="link" onClick={handleResetFilter} className="mt-2">
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <Link href={`/courses/${course.id}`} key={course.id}>
              <Card key={course.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video w-full bg-muted relative overflow-hidden">
                  {course.featuredImage ? (
                    <img
                      src={course.featuredImage}
                      alt={course.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-secondary text-secondary-foreground">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={course.courseVisibility === "public" ? "default" : "secondary"}>
                      {course.courseVisibility}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-semibold line-clamp-1" title={course.title}>
                      {course.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Badge variant="outline" className="text-xs font-normal">
                      {course.difficultyLevel}
                    </Badge>
                    <span>•</span>
                    <span>{course.enroles} Enrolled</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex-grow">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Instructor:</span>
                      <span className="font-medium truncate max-w-[120px]" title={course.instructor}>
                        {course.instructor}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Price:</span>
                      <div className="flex items-center gap-2">
                        {parseFloat(course.salePrice) < parseFloat(course.regularPrice) && (
                          <span className="line-through text-muted-foreground text-xs">
                            ${course.regularPrice}
                          </span>
                        )}
                        <span className="font-bold text-green-600">
                          ${course.salePrice || course.regularPrice}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Model:</span>
                      <Badge variant="secondary" className="text-xs">
                        {course.pricingModel}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="p-4 bg-muted/50 gap-2">
                  {authUser?.roleId === 2 && (
                    <>
                      <Link href={`/courses/${course.id}`} className="flex-1">
                        <Button variant="default" size="sm" className="w-full">
                          <Edit className="mr-2 h-3 w-3" /> Manage
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="flex-1">
                            <Trash2 className="mr-2 h-3 w-3" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Course?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{course.title}"? This action cannot be undone and will remove all associated content.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(course)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
