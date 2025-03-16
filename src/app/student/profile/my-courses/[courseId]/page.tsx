"use client";

import { getChaptersById } from "@/api/course";
import { useEffect, useState, use } from "react";
import { ChapterList } from "@/app/components/User/chapterList";
import { CustomVideoPlayer } from "@/app/components/User/chapterVideo";
import { Chapter } from "@/interface/chapters";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { backendUrl } from "@/utils/backendUrl";
import { getUserDetails } from "@/store/slice/authSlice";
import api from "@/api/axios";
import { signedUrltoNormalUrl } from "@/utils/presignedUrl";
export default function CourseDetailsAndChapters({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const dispatch = useDispatch();

  const { user } = useSelector((state: any) => state.auth);
  const userId = user.user._id;
  useEffect(() => {
    getChaptersById(courseId)
      .then((data: Chapter[]) => {
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
  for (const chapter of chapters) {
    let videoUrl = signedUrltoNormalUrl(chapter.video);
    chapter.video = videoUrl;
  }
  const handleChapterComplete = async (chapterId: string) => {
    setChapters((prevChapters) =>
      prevChapters.map((chapter) =>
        chapter._id === chapterId ? { ...chapter, completed: true } : chapter
      )
    );

    try {
      let response = await api.patch("/api/course/update-progress", {
        userId,
        courseId,
        chapterId,
      });
      let data = await response.data;
      if (data.success) {
        const updateUser = await api.get(`/api/user/find-user/${userId}`);
        const userData = await updateUser.data;

        dispatch(getUserDetails({ user: userData.data }));
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
