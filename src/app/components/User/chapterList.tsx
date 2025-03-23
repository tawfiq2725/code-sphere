import {
  Check,
  ChevronRight,
  Lock,
  PlayCircle,
  Loader2,
  Star,
} from "lucide-react";
import { Chapter } from "@/interface/chapters";
import { useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { showToast } from "@/utils/toastUtil";
import { addOrderReview, getOrderReview } from "@/api/user/user";

interface ChapterListProps {
  chapters: Chapter[];
  selectedChapter: Chapter | null;
  courseId: string;
  onSelectChapter: (chapter: Chapter) => void;
  isUpdating?: boolean;
}

interface ReviewData {
  rating: number;
  description: string;
}

export function ChapterList({
  chapters,
  selectedChapter,
  courseId,
  onSelectChapter,
  isUpdating = false,
}: ChapterListProps) {
  const { user } = useSelector((state: any) => state.auth);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [courseReview, setCourseReview] = useState<ReviewData | null>(null);
  const [hasExistingReview, setHasExistingReview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userId = user.user._id;
  const completedChapters =
    user?.user.courseProgress?.find(
      (progress: { courseId: string; completedChapters: string[] }) =>
        progress.courseId === courseId
    )?.completedChapters || [];

  const allChaptersCompleted =
    chapters.length > 0 &&
    chapters.every((chapter) => completedChapters.includes(chapter._id));

  const fetchExistingReview = async () => {
    setIsLoadingReview(true);
    try {
      const response = await getOrderReview(userId);
      if (response.success && response.data) {
        setRating(response.data.rating);
        setDescription(response.data.description);
        setIsEditingReview(true);
        setCourseReview(response.data);
        setHasExistingReview(true);
        return response.data;
      } else {
        setRating(0);
        setDescription("");
        setIsEditingReview(false);
        setCourseReview(null);
        setHasExistingReview(false);
        return null;
      }
    } catch (error) {
      console.error("Error fetching review:", error);
      setRating(0);
      setDescription("");
      setIsEditingReview(false);
      setCourseReview(null);
      setHasExistingReview(false);
      return null;
    } finally {
      setIsLoadingReview(false);
    }
  };

  useEffect(() => {
    if (allChaptersCompleted) {
      fetchExistingReview();
    }
  }, [allChaptersCompleted, courseId]);

  const openReviewModal = async () => {
    await fetchExistingReview();
    setIsReviewModalOpen(true);
  };

  const handleRatingClick = (rating: number) => {
    setRating(rating);
  };

  const submitReview = async () => {
    try {
      if (rating === 0) {
        showToast("Please select a rating", "error");
        return;
      }

      if (description.trim() === "") {
        showToast("Please provide a review description", "error");
        return;
      }

      const reviewData = {
        rating,
        description,
        userId,
      };

      const response = await addOrderReview(courseId, reviewData);
      if (response.success) {
        showToast("Review submitted successfully", "success");
        setCourseReview(reviewData);
        setHasExistingReview(true);
        setIsReviewModalOpen(false);
      } else {
        showToast("Failed to submit review", "error");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      showToast("Failed to submit review", "error");
    }
  };

  const renderStarRating = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleRatingClick(i)}
          className="focus:outline-none"
        >
          <svg
            className={`w-8 h-8 ${
              i <= rating ? "text-purple-500" : "text-gray-500"
            } cursor-pointer transition-colors duration-200`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="bg-gray-900 rounded-xl p-5 shadow-[0_0_15px_rgba(168,85,247,0.2)] border border-purple-900">
      <h3 className="text-2xl font-semibold mb-4 text-purple-400 flex items-center">
        <PlayCircle className="mr-2" size={24} />
        Chapters
      </h3>

      {isUpdating && (
        <div className="mb-4 p-2 bg-purple-900/30 rounded-lg text-center">
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin mr-2 text-pink-400" size={16} />
            <span className="text-pink-300 text-sm">Updating progress...</span>
          </div>
        </div>
      )}

      {/* Review Button - Show only when all chapters are completed */}
      {allChaptersCompleted && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Course Completed!</h4>
              <p className="text-gray-400 text-sm">
                Share your experience with this course
              </p>
            </div>
            <button
              onClick={openReviewModal}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                hasExistingReview
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-purple-600 hover:bg-purple-700"
              } text-white`}
            >
              <Star size={16} />
              <span>{hasExistingReview ? "View Review" : "Add Review"}</span>
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-1 custom-scrollbar">
        {chapters.map((chapter, index) => {
          const isCompleted = completedChapters.includes(chapter._id);
          const isLocked =
            index > 0 && !completedChapters.includes(chapters[index - 1]._id);

          return (
            <button
              key={chapter._id}
              onClick={() => !isLocked && onSelectChapter(chapter)}
              disabled={isLocked}
              className={`w-full p-4 rounded-lg transition-all flex items-center justify-between group ${
                isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
              } ${
                selectedChapter?._id === chapter._id
                  ? "bg-gradient-to-r from-purple-700 to-pink-600 text-white"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-200"
              } ${isCompleted ? "border-l-4 border-green-500" : ""}`}
            >
              <span className="text-left flex items-center">
                {isCompleted ? (
                  <div className="mr-3 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Check className="text-black" size={16} />
                  </div>
                ) : isLocked ? (
                  <Lock className="mr-3 text-gray-500" size={20} />
                ) : (
                  <div className="w-6 h-6 mr-3 rounded-full border-2 border-purple-400 flex-shrink-0" />
                )}
                <div className="flex flex-col items-start">
                  <span className="font-medium">{chapter.chapterName}</span>
                </div>
              </span>
              <ChevronRight
                size={20}
                className={
                  selectedChapter?._id === chapter._id
                    ? "text-white"
                    : "text-purple-400"
                }
              />
            </button>
          );
        })}
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg w-11/12 max-w-md border border-purple-500 shadow-lg shadow-purple-500/20 overflow-hidden">
            <div className="p-5 border-b border-purple-700 bg-gradient-to-r from-purple-900 to-gray-900">
              <h3 className="text-xl font-bold text-white">
                {isEditingReview
                  ? "Edit Course Review"
                  : "Submit Course Review"}
              </h3>
            </div>

            {isLoadingReview ? (
              <div className="p-6 flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Rating
                  </label>
                  <div className="flex gap-1">{renderStarRating()}</div>
                  <p className="text-xs text-gray-400 mt-1">
                    Selected rating: {rating > 0 ? rating : "None"}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Review
                  </label>
                  <textarea
                    ref={textareaRef}
                    autoFocus
                    value={description}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      const selectionStart = e.target.selectionStart;
                      const selectionEnd = e.target.selectionEnd;
                      setDescription(newValue);
                      setTimeout(() => {
                        if (textareaRef.current) {
                          textareaRef.current.setSelectionRange(
                            selectionStart,
                            selectionEnd
                          );
                        }
                      }, 0);
                    }}
                    placeholder="Share your thoughts about the course..."
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 resize-none"
                  ></textarea>
                  <p className="text-xs text-gray-400 mt-1">
                    {description === "" ? 0 : description.length}/500 characters
                  </p>
                </div>
              </div>
            )}

            {/* Modal footer */}
            <div className="p-4 border-t border-gray-700 bg-gray-800 flex justify-end space-x-3">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={
                  rating === 0 || description.trim() === "" || isLoadingReview
                }
                className={`px-4 py-2 rounded-md ${
                  rating === 0 || description.trim() === "" || isLoadingReview
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                } transition-colors`}
              >
                {isEditingReview ? "Update Review" : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
