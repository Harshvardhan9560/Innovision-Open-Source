"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BookOpen } from "lucide-react";
import { calculateEstimatedTime } from "@/lib/time-utils";
import DeleteRoadmap from "./DeleteRoadmap";
import DuplicateCourse from "./DuplicateCourse";

const CourseCard = ({ course, onDelete }) => {
  const { id, courseTitle, courseDescription, chapterCount, difficulty } = course;

  // Calculate estimated time
  const estimatedTime = calculateEstimatedTime(chapterCount, difficulty);

  // Get difficulty badge color
  const getDifficultyColor = (diff) => {
    switch (diff) {
      case "fast":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "balanced":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "in-depth":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getDifficultyLabel = (diff) => {
    switch (diff) {
      case "fast":
        return "Fast-paced";
      case "balanced":
        return "Balanced";
      case "in-depth":
        return "In-depth";
      default:
        return "Balanced";
    }
  };

  return (
    <Card className="w-[320px] h-[240px] relative group hover:shadow-lg transition-all duration-300 hover:border-blue-500/50 bg-card/50 backdrop-blur-sm">
      <Link href={`/roadmap/${id}`} className="absolute inset-0 z-0" />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2 leading-tight">
            {courseTitle}
          </CardTitle>
          <div className="flex items-center gap-1 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <DuplicateCourse
              id={id}
              courseTitle={courseTitle}
              onDuplicate={onDelete}
            />
            <DeleteRoadmap
              id={id}
              onDelete={onDelete}
            />
          </div>
        </div>
        <CardDescription className="line-clamp-2 text-sm">
          {courseDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Chapter Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>
            {chapterCount} {chapterCount === 1 ? "Chapter" : "Chapters"}
          </span>
        </div>

        {/* Estimated Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{estimatedTime}</span>
        </div>

        {/* Difficulty Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(
              difficulty
            )}`}
          >
            {getDifficultyLabel(difficulty)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
