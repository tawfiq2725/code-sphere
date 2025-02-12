"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { showToast } from "@/utils/toastUtil";
import { backendUrl } from "@/utils/backendUrl";
import Cookies from "js-cookie";
import Pagination from "@/app/components/common/pagination";
import CourseAction from "@/app/components/Admin/Action";
import VideoModal from "@/app/components/common/VideoModal";

export default function CourseChapterPage({
  params,
}: {
  params: Promise<{ courseId: string; courseName: string; thumbnail: string }>;
}) {
  const { courseId } = use(params);
  const [chapterData, setChapterData] = useState<Chapter[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [showModal, setShowModal] = useState(false);
  console.log("courseId", courseId);
  console.log(courseId[0], courseId[1]);
  const thumbnail = localStorage.getItem("thumbnail");
  const courseName = localStorage.getItem("courseName");
  const token = Cookies.get("jwt_token") || "";
  interface Chapter {
    _id: string;
    serialNo: number;
    courseId: string;
    chapterName: string;
    chapterDescription: string;
    image: string;
    video: string | File | null;
    isListed: boolean;
  }

  console.log(`${backendUrl}/api/course/get-chapters/${courseId[0]}`);
  const fetchCapterData = async () => {
    try {
      const response = await fetch(
        `${backendUrl}/api/course/get-chapters/${courseId[0]}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      console.log(data.data);
      if (data.success) {
        setChapterData(data.data);
      } else {
        showToast(data.message, "error");
        console.error("Error fetching chapters:", data.message);
      }
    } catch (error) {
      console.error("Error fetching chapters:", error);
      showToast("An error occurred while fetching chapters", "error");
    }
  };

  useEffect(() => {
    fetchCapterData();
  }, []);

  console.log(chapterData);

  const openEditModal = (chapter: Chapter) => {
    setCurrentChapter({
      ...chapter,
      video: chapter.video,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setCurrentChapter(null);
    setIsEditModalOpen(false);
  };

  // Pagination logic
  const indexOfLastChapter = currentPage * itemsPerPage;
  const indexOfFirstChapter = indexOfLastChapter - itemsPerPage;
  const currentChapters = chapterData.slice(
    indexOfFirstChapter,
    indexOfLastChapter
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const status = localStorage.getItem("courseStatus");
  return (
    <div className="mx-auto p-4 w-full h-screen flex  justify-center bg-black ">
      <div className="bg-gray-800 text-white mx-auto p-4">
        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-700 flex justify-between">
            <div>
              <h1 className="text-2xl font-bold">Chapter Management</h1>
              <h3 className="text-lg mt-2">{courseName}</h3>
            </div>
            <div>
              {status !== "approved" && <CourseAction courseId={courseId[0]} />}
            </div>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-3 border-b border-gray-600">S.No</th>
                    <th className="p-3 border-b border-gray-600">Course ID</th>
                    <th className="p-3 border-b border-gray-600">Image</th>
                    <th className="p-3 border-b border-gray-600">
                      Chapter Name
                    </th>
                    <th className="p-3 border-b border-gray-600">Video</th>
                    <th className="p-3 border-b border-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentChapters.map((chapter, index) => (
                    <tr key={index} className="hover:bg-gray-700">
                      <td className="p-3 border-b border-gray-600">
                        {index + 1}
                      </td>
                      <td className="p-3 border-b border-gray-600">
                        {chapter.courseId}
                      </td>
                      <td className="p-3 border-b border-gray-600">
                        <Image
                          src={thumbnail || "/placeholder.svg"}
                          alt={chapter.chapterName}
                          width={50}
                          height={50}
                        />
                      </td>
                      <td className="p-3 border-b border-gray-600">
                        {chapter.chapterName}
                      </td>
                      <td className="p-3 border-b border-gray-600">
                        {chapter.video ? "Uploaded" : "Not uploaded"}
                      </td>
                      <td className="p-3 border-b border-gray-600">
                        <button
                          onClick={() => openEditModal(chapter)}
                          className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600 transition duration-200 mr-2"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(chapterData.length / itemsPerPage)}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {/* Edit Chapter Modal */}
      {isEditModalOpen && currentChapter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-gray-800 p-4 sm:p-6 md:p-8 rounded-lg w-full max-w-md text-white">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">View Chapter</h2>
            <p className="mb-4 text-sm sm:text-base text-gray-300">
              View the details of the chapters datas
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
                  defaultValue={currentChapter.chapterName}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white p-2"
                  readOnly
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  defaultValue={currentChapter.chapterDescription}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white p-2"
                  rows={3}
                  readOnly
                />
              </div>

              {currentChapter.video && (
                <div>
                  <a className="text-sm text-gray-300">
                    Current video:{" "}
                    {currentChapter.video instanceof File ? (
                      "File Selected"
                    ) : (
                      <div>
                        <button
                          onClick={() => setShowModal(true)}
                          className="text-blue-400 hover:underline"
                        >
                          View video
                        </button>

                        {showModal && (
                          <VideoModal
                            videoUrl={currentChapter.video}
                            onClose={() => setShowModal(false)}
                          />
                        )}
                      </div>
                    )}
                  </a>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={closeEditModal}
                className="px-3 py-1 sm:px-4 sm:py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
