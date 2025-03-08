"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import { showToast } from "@/utils/toastUtil";
import { backendUrl } from "@/utils/backendUrl";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import api from "@/api/axios";
import VideoModal from "@/app/components/common/VideoModal";

export default function CourseChapterPage({
  params,
}: {
  params: Promise<{ courseId: string; courseName: string; thumbnail: string }>;
}) {
  const { courseId } = use(params);

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

  const [chapterData, setChapterData] = useState<Chapter[]>([]);
  console.log(`${backendUrl}/api/course/get-chapters/${courseId[0]}`);
  const fetchCapterData = async () => {
    try {
      const response = await api.get(`/api/course/get-chapters/${courseId[0]}`);
      const data = await response.data;
      console.log("----------------------", data);
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

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [newChapter, setNewChapter] = useState<Partial<Chapter>>({});
  const router = useRouter();
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

  const openAddModal = () => {
    setNewChapter({});
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setNewChapter({});
    setIsAddModalOpen(false);
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newChapter.chapterName ||
      !newChapter.chapterDescription ||
      !newChapter.video
    ) {
      return showToast("Please fill all the fields", "error");
    }

    const chapterNameRegex = /^[a-zA-Z\s]+$/;
    const chapterDescriptionRegex = /^[a-zA-Z.,\s]+$/;
    if (!chapterNameRegex.test(newChapter.chapterName)) {
      return showToast("Chapter name should contain only alphabets", "error");
    }
    if (!chapterDescriptionRegex.test(newChapter.chapterDescription)) {
      return showToast(
        "Chapter description should contain only alphabets",
        "error"
      );
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("courseId", (await params).courseId);
    formData.append("chapterName", newChapter.chapterName);
    formData.append("chapterDescription", newChapter.chapterDescription);
    if (newChapter.video) {
      formData.append("video", newChapter.video);
    }
    try {
      const response = await api.post(`/api/course/add-chapter`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.data;
      if (data.success) {
        showToast(data.message, "success");
        setChapters([...chapters, data.chapter]);
        fetchCapterData();
      } else {
        showToast(data.message, "error");
        console.error("Error adding chapter:", data.message);
      }
    } catch (error) {
      console.error("Error adding chapter:", error);
      showToast("An error occurred while adding the chapter", "error");
    } finally {
      setIsLoading(false);
    }

    closeAddModal();
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isNewChapter: boolean
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isNewChapter) {
        setNewChapter({ ...newChapter, video: file });
      } else if (currentChapter) {
        setCurrentChapter({ ...currentChapter, video: file });
      }
    }
  };

  const handleEditChapter = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !currentChapter?.chapterName ||
      !currentChapter?.chapterDescription ||
      !currentChapter?.video
    ) {
      return showToast("Please fill all the fields", "error");
    }

    const chapterNameRegex = /^[a-zA-Z\s]+$/;
    const chapterDescriptionRegex = /^[a-zA-Z.,\s]+$/;
    if (!chapterNameRegex.test(currentChapter.chapterName)) {
      return showToast("Chapter name should contain only alphabets", "error");
    }
    if (!chapterDescriptionRegex.test(currentChapter.chapterDescription)) {
      return showToast(
        "Chapter description should contain only alphabets",
        "error"
      );
    }

    setIsLoading(true);
    if (!currentChapter) return;

    const formData = new FormData();
    formData.append("courseId", currentChapter.courseId);
    if (
      currentChapter.chapterName !==
      chapterData.find((c) => c._id === currentChapter._id)?.chapterName
    ) {
      formData.append("chapterName", currentChapter.chapterName);
    }
    if (
      currentChapter.chapterDescription !==
      chapterData.find((c) => c._id === currentChapter._id)?.chapterDescription
    ) {
      formData.append("chapterDescription", currentChapter.chapterDescription);
    }
    if (currentChapter.video instanceof File) {
      formData.append("video", currentChapter.video);
    }

    try {
      const response = await fetch(
        `${backendUrl}/api/course/update-chapter/${currentChapter._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        showToast(data.message, "success");
        fetchCapterData();
      } else {
        showToast(data.message, "error");
        console.error("Error updating chapter:", data.message);
      }
    } catch (error) {
      console.error("Error updating chapter:", error);
      showToast("An error occurred while updating the chapter", "error");
    } finally {
      setIsLoading(true);
    }

    closeEditModal();
  };

  return (
    <div className="mx-auto p-4 w-full h-screen flex  justify-center bg-black ">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"
            role="status"
          ></div>
        </div>
      )}
      <div className="bg-gray-800 text-white mx-auto p-4">
        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold">Chapter Management</h1>
            <h3 className="text-lg mt-2">{courseName}</h3>
          </div>
          <div className="p-6">
            <button
              onClick={openAddModal}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-200 mb-4"
            >
              Add Chapter
            </button>
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
                  {chapterData.map((chapter, index) => (
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
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition duration-200 mr-2"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Chapter Modal */}
      {isEditModalOpen && currentChapter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-gray-800 p-4 sm:p-6 md:p-8 rounded-lg w-full max-w-md text-white">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Edit Chapter</h2>
            <p className="mb-4 text-sm sm:text-base text-gray-300">
              Make changes to the chapter details here. Click save when you're
              done.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
                  value={currentChapter.chapterName}
                  onChange={(e) =>
                    setCurrentChapter({
                      ...currentChapter,
                      chapterName: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white p-2"
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
                  value={currentChapter.chapterDescription}
                  onChange={(e) =>
                    setCurrentChapter({
                      ...currentChapter,
                      chapterDescription: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white p-2"
                  rows={3}
                />
              </div>
              <div>
                <label htmlFor="video" className="block text-sm font-medium">
                  Video
                </label>
                <input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, false)}
                  className="mt-1 block w-full text-sm text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-600 file:text-white
                  hover:file:bg-purple-700"
                />
              </div>
              {currentChapter.video && (
                <div>
                  <p className="text-sm text-gray-300">
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
                  </p>
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
              <button
                onClick={handleEditChapter}
                className="px-3 py-1 sm:px-4 sm:py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Chapter Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md text-white">
            <h2 className="text-2xl font-bold mb-4">Add New Chapter</h2>
            <p className="mb-4 text-gray-300">
              Enter the details for the new chapter. Click add when you're done.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="new-name" className="block text-sm font-medium">
                  Name
                </label>
                <input
                  id="new-name"
                  value={newChapter.chapterName || ""}
                  onChange={(e) =>
                    setNewChapter({
                      ...newChapter,
                      chapterName: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="new-description"
                  className="block text-sm font-medium"
                >
                  Description
                </label>
                <textarea
                  id="new-description"
                  value={newChapter.chapterDescription || ""}
                  onChange={(e) =>
                    setNewChapter({
                      ...newChapter,
                      chapterDescription: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="new-video"
                  className="block text-sm font-medium"
                >
                  Video
                </label>
                <input
                  id="new-video"
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, true)}
                  className="mt-1 block w-full text-sm text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-600 file:text-white
                  hover:file:bg-purple-700"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={closeAddModal}
                className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Cancel
              </button>
              <button
                onClick={handleAddChapter}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Add Chapter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
