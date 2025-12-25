"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { ChevronDown, ChevronUp, ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar({ roadmap, id, isStudioCourse, courseId }) {
    const [isOverviewVisible, setIsOverviewVisible] = useState(true);
    const [expandedChapters, setExpandedChapters] = useState({});
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [chapters, setChapters] = useState([]);
    const [activeSubtopic, setActiveSubtopic] = useState(null);
    const [activeChapter, setActiveChapter] = useState(null);
    const query = useSearchParams();
    const router = useRouter();

    const toggleChapter = (index) => {
        setExpandedChapters((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const navigateToSubtopic = (chapterIndex, subtopicIndex) => {
        setActiveChapter(chapterIndex);
        setActiveSubtopic(subtopicIndex);
        
        if (isStudioCourse) {
            router.push(`/studio-course/${courseId}/${chapterIndex + 1}`);
        } else {
            router.push(
                `/chapter-test/${id}/${chapterIndex + 1}?subtopic=${subtopicIndex}`
            );
        }

        if (window.innerWidth < 1024) {
            setIsMobileSidebarOpen(false);
        }
    };

    useEffect(() => {
        setChapters(roadmap?.chapters || []);

        const pathParts = window.location.pathname.split("/");
        const chapterNumber = pathParts[pathParts.length - 1];
        if (chapterNumber && !isNaN(chapterNumber)) {
            setActiveChapter(parseInt(chapterNumber) - 1);
        }

        const urlParams = new URLSearchParams(window.location.search);
        const subtopicParam = urlParams.get("subtopic");
        if (subtopicParam) {
            setActiveSubtopic(parseInt(subtopicParam));
        }

        setExpandedChapters({ [parseInt(chapterNumber) - 1]: true });
    }, [roadmap]);

    useEffect(() => {
        setActiveSubtopic(Number(query.get("subtopic")));
    }, [query.get("subtopic")]);

    return (
        <>
            {!isMobileSidebarOpen && (
                <Button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    variant={"ghost"}
                    className={"absolute lg:hidden top-20 right-4"}
                >
                    <Menu size={24} />
                </Button>
            )}

            <aside
                className={`
        fixed top-16 left-0 z-40 h-screen border-r border-border
        transition-all duration-200 pb-24 ease-in-out shrink-0 custom-scroll
        ${
            isMobileSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
        }
        w-[95vw] max-w-lg lg:w-96 p-6 bg-card overflow-y-scroll
      `}
            >
                {isMobileSidebarOpen && (
                    <Button
                        onClick={() => setIsMobileSidebarOpen(false)}
                        variant={"ghost"}
                        className={"absolute lg:hidden top-0 right-0"}
                    >
                        <X size={24} />
                    </Button>
                )}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold dark:text-white">
                            Course Roadmap
                        </h2>
                        <button
                            onClick={() =>
                                setIsOverviewVisible(!isOverviewVisible)
                            }
                            className="flex items-center text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition"
                        ></button>
                    </div>
                    <nav className="flex flex-col mt-2 space-y-1">
                        {!roadmap["chapters"] &&
                            Array(10)
                                .fill(0)
                                .map((e, index) => (
                                    <Skeleton
                                        key={index}
                                        className={"w-full h-12"}
                                    ></Skeleton>
                                ))}
                        {roadmap &&
                            chapters.map((chapter, chapterIndex) => (
                                <div
                                    key={chapterIndex}
                                    className="rounded-lg overflow-hidden"
                                >
                                    <button
                                        onClick={() =>
                                            toggleChapter(chapterIndex)
                                        }
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 text-left bg-zinc-50 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition",
                                            expandedChapters[chapterIndex] &&
                                                "rounded-b-none",
                                            activeChapter === chapterIndex &&
                                                "bg-blue-50 hover:bg-blue-100 dark:hover:bg-blue-900/50 dark:bg-blue-950/60"
                                        )}
                                        aria-expanded={
                                            expandedChapters[chapterIndex]
                                        }
                                    >
                                        <span className="font-medium cursor-pointer flex gap-1">
                                            <span className="inline-block shrink-0 w-6 h-6 mr-2 text-xs text-center leading-6 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                                {chapterIndex + 1}
                                            </span>
                                            {chapter.chapterTitle}
                                        </span>
                                        {expandedChapters[chapterIndex] ? (
                                            <ChevronUp
                                                size={18}
                                                className="text-zinc-400"
                                            />
                                        ) : (
                                            <ChevronDown
                                                size={18}
                                                className="text-zinc-400"
                                            />
                                        )}
                                    </button>

                                    {expandedChapters[chapterIndex] && chapter.contentOutline && (
                                        <div className="pl-4 py-2 bg-zinc-50 dark:bg-zinc-900/80 rounded-b-lg">
                                            {chapter.contentOutline.map(
                                                (content, subtopicIndex) => {
                                                    const isActive =
                                                        activeChapter ===
                                                            chapterIndex &&
                                                        activeSubtopic ===
                                                            subtopicIndex;

                                                    return (
                                                        <button
                                                            key={subtopicIndex}
                                                            onClick={() =>
                                                                navigateToSubtopic(
                                                                    chapterIndex,
                                                                    subtopicIndex
                                                                )
                                                            }
                                                            className={`
                              group flex items-center w-full px-3 py-2 cursor-pointer rounded-md text-sm
                              transition-colors duration-150 ease-in-out
                              ${
                                  isActive
                                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700/50"
                              }
                            `}
                                                        >
                                                            <ChevronRight
                                                                size={14}
                                                                className={`mr-2 ${
                                                                    isActive
                                                                        ? "text-blue-500 dark:text-blue-400"
                                                                        : "text-zinc-400"
                                                                }`}
                                                            />
                                                            <span className="truncate">
                                                                {
                                                                    content.split(
                                                                        ":"
                                                                    )[0]
                                                                }
                                                            </span>
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                    </nav>
                </div>
            </aside>
        </>
    );
}
