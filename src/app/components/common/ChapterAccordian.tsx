"use client";

import { useState } from "react";

interface Chapter {
  chapterName: string;
  chapterDescription: string;
}

interface ChapterAccordionProps {
  chapter: Chapter;
}

const ChapterAccordion: React.FC<ChapterAccordionProps> = ({ chapter }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-700 rounded mb-4 overflow-hidden shadow-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-black text-white hover:bg-gray-800 transition-colors"
      >
        <span className="text-lg font-bold">{chapter.chapterName}</span>
        <span className="text-2xl font-bold">{isOpen ? "–" : "+"}</span>
      </button>
      {isOpen && (
        <div className="p-4 bg-black text-white border-t border-gray-700">
          <p>{chapter.chapterDescription}</p>
        </div>
      )}
    </div>
  );
};

export default ChapterAccordion;
