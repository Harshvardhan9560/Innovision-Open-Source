"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/sidebar/page";
import StudioContent from "@/components/chapter_content/StudioContent";
import { useSession } from "next-auth/react";
import { useContext } from "react";
import xpContext from "@/contexts/xp";

export default function StudioCoursePage() {
  const params = useParams();
  const { data: session } = useSession();
  const [course, setCourse] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { awardXP } = useContext(xpContext);
  const [viewAwarded, setViewAwarded] = useState(false);
  
  const chapterIndex = parseInt(params.chapterId) - 1;

  useEffect(() => {
    fetchCourse();
  }, [params.courseId]);

  // Award XP for viewing chapter
  useEffect(() => {
    if (session && awardXP && !viewAwarded) {
      awardXP('view_course');
      setViewAwarded(true);
    }
  }, [session, awardXP, viewAwarded]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${params.courseId}`);
      if (res.ok) {
        const data = await res.json();
        setCourseData(data); // Store original data
        
        // Transform course data to match roadmap structure for Sidebar
        const transformedData = {
          courseTitle: data.title,
          courseDescription: data.description,
          chapters: data.chapters.map((ch, idx) => ({
            chapterNumber: idx + 1,
            chapterTitle: ch.title,
            chapterDescription: ch.description,
            contentOutline: [],
            completed: false
          }))
        };
        setCourse(transformedData);
      }
    } catch (error) {
      console.error("Failed to fetch course");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course || !courseData || !courseData.chapters || !courseData.chapters[chapterIndex]) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chapter not found</p>
      </div>
    );
  }

  const currentChapter = courseData.chapters[chapterIndex];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        roadmap={course}
        roadmapId={params.courseId}
        activeChapter={chapterIndex}
        activeSubtopic={0}
        isStudioCourse={true}
        courseId={params.courseId}
      />
      <div className="flex-1 pt-20 lg:ml-96">
        <div className="p-6 max-w-4xl mx-auto">
          <StudioContent content={currentChapter.content} />
        </div>
      </div>
    </div>
  );
}
