"use client";

import { useEffect, useState, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RefreshCw,
  Loader2,
  Maximize,
  Minimize,
  SkipForward,
} from "lucide-react";
import type React from "react";

interface CustomVideoPlayerProps {
  src: string;
  onComplete: () => void;
}

export function CustomVideoPlayer({ src, onComplete }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoadingVideo(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      onComplete();
    };

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleCanPlay = () => setIsBuffering(false);
    const handleError = () => {
      setError("Error loading video. Please try again.");
      setLoadingVideo(false);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [onComplete]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setLoadingVideo(true);
      setError(null);

      // Load the new video
      video.src = src;
      video.load();
    }
  }, [src]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error);
        setError("Could not play video. Please try again.");
      });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (videoRef.current.volume > 0) {
        videoRef.current.volume = 0;
        setVolume(0);
      } else {
        videoRef.current.volume = 1;
        setVolume(1);
      }
    }
  };

  const togglePlaybackRate = () => {
    const rates = [1, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const newRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(newRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number.parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      const newTime = Math.min(videoRef.current.currentTime + 10, duration);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const reload = () => {
    if (videoRef.current) {
      const currentPlayTime = videoRef.current.currentTime;
      videoRef.current.load();
      videoRef.current.currentTime = currentPlayTime;
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const showControls = () => {
    setControlsVisible(true);

    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }

    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setControlsVisible(false);
      }
    }, 3000);
  };

  return (
    <div
      ref={containerRef}
      className="bg-black rounded-lg shadow-lg overflow-hidden relative group"
      onMouseMove={showControls}
      onClick={() => {
        if (!isBuffering && !loadingVideo) togglePlayPause();
      }}
    >
      {loadingVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-20">
          <div className="text-center">
            <Loader2
              size={48}
              className="animate-spin text-purple-500 mx-auto mb-4"
            />
            <p className="text-white">Loading video...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-20">
          <div className="text-center p-4 bg-gray-900 rounded-lg max-w-md">
            <p className="text-red-400 mb-3">{error}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setError(null);
                reload();
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white focus:outline-none"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="text-center">
            <RefreshCw
              size={40}
              className="animate-spin text-purple-400 mx-auto"
            />
            <p className="text-white mt-2">Buffering...</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video object-contain bg-black"
        preload="auto"
        playsInline
      />

      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 transition-opacity duration-300 ${
          controlsVisible || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <input
            type="range"
            min={0}
            max={duration || 1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 rounded-full appearance-none bg-gray-700 accent-purple-600 cursor-pointer"
            style={{
              backgroundImage: `linear-gradient(to right, #d946ef ${
                (currentTime / (duration || 1)) * 100
              }%, #4b5563 ${(currentTime / (duration || 1)) * 100}%)`,
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlayPause}
              className="text-white hover:text-purple-400 transition-colors focus:outline-none"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              onClick={toggleMute}
              className="text-white hover:text-purple-400 transition-colors focus:outline-none"
            >
              {volume > 0 ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1.5 rounded-full appearance-none bg-gray-700 accent-purple-600 cursor-pointer"
              style={{
                backgroundImage: `linear-gradient(to right, #d946ef ${
                  volume * 100
                }%, #4b5563 ${volume * 100}%)`,
              }}
            />
            <button
              onClick={skipForward}
              className="text-white hover:text-purple-400 transition-colors focus:outline-none ml-2"
            >
              <SkipForward size={22} />
            </button>
            <button
              onClick={togglePlaybackRate}
              className="text-white hover:text-purple-400 transition-colors focus:outline-none px-2 py-1 bg-gray-800 rounded-md"
            >
              <span className="text-sm font-medium">{playbackRate}x</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <button
              onClick={reload}
              className="text-white hover:text-purple-400 transition-colors focus:outline-none"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-purple-400 transition-colors focus:outline-none"
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Play/Pause overlay icon */}
      {!isPlaying && !isBuffering && !loadingVideo && !error && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black bg-opacity-40 rounded-full p-5">
            <Play size={42} className="text-purple-400" />
          </div>
        </div>
      )}
    </div>
  );
}
