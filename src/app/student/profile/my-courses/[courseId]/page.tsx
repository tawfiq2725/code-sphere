"use client";

import {
  getChaptersById,
  updateChapters,
  userGetsByCourse,
} from "@/api/course";
import { useEffect, useState, use } from "react";
import { ChapterList } from "@/app/components/User/chapterList";
import { CustomVideoPlayer } from "@/app/components/User/chapterVideo";
import { Chapter } from "@/interface/chapters";
import { useSelector, useDispatch } from "react-redux";
import { getUserDetails } from "@/store/slice/authSlice";
import { signedUrltoNormalUrl } from "@/utils/presignedUrl";
import { Loader2 } from "lucide-react";

export default function CourseDetailsAndChapters({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const dispatch = useDispatch();

  const { user } = useSelector((state: any) => state.auth);
  const userId = user.user._id;

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setIsLoading(true);
        const data: Chapter[] = await getChaptersById(courseId);

        const chaptersWithStatus = data.map((chapter) => {
          const videoUrl = signedUrltoNormalUrl(chapter.video);
          return {
            ...chapter,
            video: videoUrl,
            completed: false,
          };
        });

        setChapters(chaptersWithStatus);

        if (chaptersWithStatus.length > 0) {
          setSelectedChapter(chaptersWithStatus[0]);
        }
      } catch (error) {
        console.error("Failed to fetch chapters:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapters();
  }, [courseId]);

  const handleChapterComplete = async (chapterId: string) => {
    setIsUpdating(true);

    setChapters((prevChapters) =>
      prevChapters.map((chapter) =>
        chapter._id === chapterId ? { ...chapter, completed: true } : chapter
      )
    );

    try {
      const data = await updateChapters(userId, courseId, chapterId);
      if (data.success) {
        const userData = await userGetsByCourse(userId);
        dispatch(getUserDetails({ user: userData.data }));

        const currentIndex = chapters.findIndex(
          (chapter) => chapter._id === chapterId
        );
        if (currentIndex < chapters.length - 1) {
          setSelectedChapter(chapters[currentIndex + 1]);
        }
      } else {
        console.log("Chapter progress update failed");
      }
    } catch (error) {
      console.error("Failed to update chapter progress:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin text-purple-500" size={48} />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-center text-purple-400 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Course Chapters
          </h1>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              {selectedChapter ? (
                <>
                  <CustomVideoPlayer
                    src={selectedChapter.video}
                    onComplete={() =>
                      handleChapterComplete(selectedChapter._id)
                    }
                  />
                  <div className="bg-gray-900 p-4 border-t border-purple-700">
                    <h2 className="text-2xl font-semibold text-purple-300">
                      {selectedChapter.chapterName}
                    </h2>
                    {selectedChapter.description && (
                      <p className="mt-2 text-gray-300">
                        {selectedChapter.description}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                  <p className="text-center text-xl text-gray-400">
                    Select a chapter to watch its video.
                  </p>
                </div>
              )}
            </div>

            <div className="w-full lg:w-1/3">
              <ChapterList
                chapters={chapters}
                selectedChapter={selectedChapter}
                courseId={courseId}
                onSelectChapter={(chapter: Chapter) =>
                  setSelectedChapter(chapter)
                }
                isUpdating={isUpdating}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
