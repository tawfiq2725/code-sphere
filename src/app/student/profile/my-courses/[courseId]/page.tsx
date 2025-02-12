"use client";

import { getChaptersById } from "@/api/course";
import { useEffect, useState, use } from "react";
import { ChapterList } from "@/app/components/User/chapterList";
import { CustomVideoPlayer } from "@/app/components/User/chapterVideo";
import { Chapter } from "@/interface/chapters";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import { backendUrl } from "@/utils/backendUrl";

export default function CourseDetailsAndChapters({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const token = Cookies.get("jwt_token");
  const { user } = useSelector((state: any) => state.auth);
  const userId = user.user._id;
  useEffect(() => {
    getChaptersById(courseId)
      .then((data: Chapter[]) => {
        console.log(data);
        const chaptersWithStatus = data.map((chapter) => ({
          ...chapter,
          completed: false,
        }));
        setChapters(chaptersWithStatus);
        if (chaptersWithStatus.length > 0) {
          setSelectedChapter(chaptersWithStatus[0]);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, [courseId]);

  const handleChapterComplete = async (chapterId: string) => {
    setChapters((prevChapters) =>
      prevChapters.map((chapter) =>
        chapter._id === chapterId ? { ...chapter, completed: true } : chapter
      )
    );

    try {
      let response = await fetch(`${backendUrl}/api/course/update-progress`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, chapterId, courseId }),
      });
      let data = await response.json();
      console.log(data);
      if (data.success) {
        console.log("Chapter progress updated successfully");
      } else {
        console.log("Chapter progress update failed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">
          Course Chapters
        </h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            {selectedChapter ? (
              <CustomVideoPlayer
                src={selectedChapter.video}
                onComplete={() => handleChapterComplete(selectedChapter._id)}
              />
            ) : (
              <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
                <p className="text-center text-xl">
                  Select a chapter to watch its video.
                </p>
              </div>
            )}
            {selectedChapter && (
              <h2 className="text-2xl font-semibold mt-4 mb-2 text-blue-300">
                {selectedChapter.chapterName}
              </h2>
            )}
          </div>
          <div className="w-full lg:w-1/3">
            <ChapterList
              chapters={chapters}
              selectedChapter={selectedChapter}
              onSelectChapter={(chapter: Chapter) =>
                setSelectedChapter(chapter)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
