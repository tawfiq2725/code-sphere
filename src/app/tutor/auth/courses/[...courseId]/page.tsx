"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { showToast } from "@/utils/toastUtil";
import { backendUrl } from "@/utils/backendUrl";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

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

  const handleAddChapter = async () => {
    if (
      !newChapter.chapterName ||
      !newChapter.chapterDescription ||
      !newChapter.video
    ) {
      return showToast("Please fill all the fields", "error");
    }
    const formData = new FormData();
    formData.append("courseId", (await params).courseId);
    formData.append("chapterName", newChapter.chapterName);
    formData.append("chapterDescription", newChapter.chapterDescription);
    if (newChapter.video) {
      formData.append("video", newChapter.video);
    }
    try {
      const response = await fetch(`${backendUrl}/api/course/add-chapter`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        showToast(data.message, "success");
        setChapters([...chapters, data.chapter]);
        router.refresh();
      } else {
        showToast(data.message, "error");
        console.error("Error adding chapter:", data.message);
      }
    } catch (error) {
      console.error("Error adding chapter:", error);
      showToast("An error occurred while adding the chapter", "error");
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

  const handleEditChapter = async () => {
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
    }

    closeEditModal();
  };

  const toggleChapterStatus = async (
    chapterId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(
        `${backendUrl}/api/course/toggle-chapter-status/${chapterId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: !currentStatus }),
        }
      );

      const data = await response.json();
      if (data.success) {
        showToast(data.message, "success");
        fetchCapterData();
      } else {
        showToast(data.message, "error");
        console.error("Error toggling chapter status:", data.message);
      }
    } catch (error) {
      console.error("Error toggling chapter status:", error);
      showToast("An error occurred while toggling the chapter status", "error");
    }
  };

  return (
    <div className="mx-auto p-4 w-full h-screen flex  justify-center bg-black ">
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
                    <th className="p-3 border-b border-gray-600">Status</th>
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
                          onClick={() =>
                            toggleChapterStatus(chapter._id, chapter.isListed)
                          }
                          className={`px-2 py-1 rounded ${
                            chapter.isListed
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-red-500 hover:bg-red-600"
                          } transition duration-200`}
                        >
                          {chapter.isListed ? "Listed" : "Unlisted"}
                        </button>
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
                      <a
                        href={currentChapter.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        View video
                      </a>
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
