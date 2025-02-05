"use client";

import { FC } from "react";

interface VideoModalProps {
  videoUrl: string;
  onClose: () => void;
}

const VideoModal: FC<VideoModalProps> = ({ videoUrl, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="relative w-full max-w-4xl mx-auto p-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-3xl font-bold hover:text-gray-300"
        >
          &times;
        </button>
        =
        <div className="bg-black rounded shadow-lg overflow-hidden">
          <div className="aspect-video">
            <iframe
              src={videoUrl}
              title="Video Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
