import React, { useState, useRef } from "react";
import { HelpCircle, Lock, ChevronDown, ChevronUp, Play } from "lucide-react";
import { signedUrltoNormalUrl } from "@/utils/presignedUrl";

interface Chapter {
  title: string;
  duration: string;
  video?: string;
  description: string;
}

interface ChapterAccordionProps {
  chapter: Chapter;
  index: number;
  isFirstChapter: boolean;
  scrollToTop: () => void;
}

export const ChapterAccordion = ({
  chapter,
  index,
  isFirstChapter,
  scrollToTop,
}: ChapterAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    if (isFirstChapter) {
      setIsOpen(!isOpen);
    } else {
      scrollToTop();
    }
  };
  if (chapter.video) chapter.video = signedUrltoNormalUrl(chapter?.video);

  return (
    <div className="border border-purple-800 rounded-md mb-4 bg-black bg-opacity-60 overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={toggleAccordion}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center mr-3">
            {isFirstChapter ? (
              <Play className="w-4 h-4 text-white" />
            ) : (
              <Lock className="w-4 h-4 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-white font-medium text-lg">{chapter.title}</h3>
            <p className="text-gray-400 text-sm">{chapter.duration}</p>
          </div>
        </div>

        {isFirstChapter && (
          <div className="text-purple-400">
            {isOpen ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        )}
      </div>

      {isFirstChapter && isOpen && (
        <div className="px-4 pb-4">
          {chapter.video ? (
            <div className="aspect-video rounded-md overflow-hidden bg-black">
              <iframe
                src={chapter.video}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="bg-gray-900 text-gray-400 p-4 rounded text-center">
              Video not available
            </div>
          )}

          <div className="mt-4 text-gray-300">
            <p>{chapter.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};
