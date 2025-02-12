import { Check, ChevronRight } from "lucide-react";
import { Chapter } from "@/interface/chapters";
interface ChapterListProps {
  chapters: Chapter[];
  selectedChapter: Chapter | null;
  onSelectChapter: (chapter: Chapter) => void;
}

import { useSelector } from "react-redux";

export function ChapterList({
  chapters,
  selectedChapter,
  onSelectChapter,
}: ChapterListProps) {
  const { user } = useSelector((state: any) => state.auth);

  console.log(chapters, "chapters");
  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
      <h3 className="text-2xl font-semibold mb-4 text-blue-300">Chapters</h3>
      <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
        {chapters.map((chapter) => (
          <button
            key={chapter._id}
            onClick={() => onSelectChapter(chapter)}
            className={`w-full p-3 rounded-md transition-colors flex items-center justify-between ${
              selectedChapter?._id === chapter._id
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-gray-200"
            }`}
          >
            <span className="text-left flex items-center">
              {chapter.completed ? (
                <Check className="mr-2 text-green-400" size={20} />
              ) : (
                <div className="w-5 h-5 mr-2 rounded-full border-2 border-gray-400" />
              )}
              {chapter.chapterName}
            </span>
            <ChevronRight size={20} />
          </button>
        ))}
      </div>
    </div>
  );
}
