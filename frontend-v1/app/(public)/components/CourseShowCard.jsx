"use client";
import { useState } from "react";
import moment from "moment";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import StarRating from "@/app/Components/StarRating";

// Shadcn UI
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const CourseShowCard = ({ course, cardUrl = null, apiUrl }) => {
  const { darkMode } = useTheme();

  const defaultAvatar = "/default-avatar.jpg";

  function getAverageRating(ratings) {
    if (!ratings || ratings.length === 0) return 0;
    const totalRating = ratings.reduce(
      (sum, rating) => sum + parseFloat(rating.rating),
      0
    );
    return totalRating / ratings.length;
  }

  const averageRating = getAverageRating(course.rating);

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:w-[300px] w-[210px] flex flex-col h-full
        ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
    >
      <Link
        href={cardUrl ? `${cardUrl}${course.id}` : `/detailCourse/${course.id}`}
        className="block relative w-full sm:h-[200px] h-[140px] overflow-hidden"
      >
        <img
          src={course.featuredImage || "/default-course.jpg"}
          alt={course.title || "Course Image"}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {course.pricingModel === "Free" && (
          <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">Free</Badge>
        )}
      </Link>

      <CardContent className="p-4 flex-1 flex flex-col gap-2">
        <Link href={`/profile/${course?.instructor?.id}`} className="flex items-center space-x-2 group">
          <Avatar className="h-8 w-8 border border-white shadow-sm">
            <AvatarImage src={course?.instructor?.profile?.pPic} alt={course?.instructor?.profile?.name} />
            <AvatarFallback>{course?.instructor?.profile?.name?.charAt(0) || "I"}</AvatarFallback>
          </Avatar>
          <p className="text-sm font-medium truncate text-muted-foreground group-hover:text-primary transition-colors">
            {course?.instructor?.profile?.name || "Unknown Instructor"}
          </p>
        </Link>

        <Link href={cardUrl ? `${cardUrl}${course.id}` : `/detailCourse/${course.id}`} className="block">
          <h3 className="text-lg font-bold leading-tight line-clamp-2 hover:text-primary transition-colors">
            {course.title || "Untitled Course"}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground line-clamp-2 mt-1 flex-1">
          {course.description || "No description available."}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-yellow-500 font-bold text-sm">{averageRating.toFixed(1)}</span>
          <StarRating value={averageRating} readonly size="sm" />
          <span className="text-xs text-muted-foreground">({course.rating?.length || 0})</span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex flex-col">
            {course.pricingModel === "Paid" ? (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-primary">
                  ${parseFloat(course.salePrice || 0).toFixed(2)}
                </span>
                {course.regularPrice && parseFloat(course.regularPrice) > parseFloat(course.salePrice) && (
                  <span className="text-sm line-through text-muted-foreground">
                    ${parseFloat(course.regularPrice).toFixed(2)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-lg font-bold text-green-600">Free</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {moment(course.createdAt).fromNow()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseShowCard;
