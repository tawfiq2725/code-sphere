"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface Chapter {
  id: string;
  serialNo: number;
  courseId: string;
  name: string;
  description: string;
  image: string;
  video: File | null;
  isListed: boolean;
}

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const initialChapters: Chapter[] = [
  {
    id: "1",
    serialNo: 1,
    courseId: "CS001",
    name: "Introduction to JavaScript",
    description: "Learn the basics of JavaScript programming",
    image: "/placeholder.svg?height=40&width=40",
    video: null,
    isListed: false,
  },
  {
    id: "2",
    serialNo: 2,
    courseId: "CS001",
    name: "Advanced JavaScript Concepts",
    description: "Dive deep into advanced JavaScript topics",
    image: "/placeholder.svg?height=40&width=40",
    video: null,
    isListed: true,
  },
];

export default function ChapterManagement() {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [newChapter, setNewChapter] = useState<Partial<Chapter>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = (chapterId: string) => {
    setChapters(chapters.filter((chapter) => chapter.id !== chapterId));
  };

  const handleToggleStatus = (chapterId: string) => {
    setChapters(
      chapters.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, isListed: !chapter.isListed }
          : chapter
      )
    );
  };

  const openEditModal = (chapter: Chapter) => {
    setCurrentChapter(chapter);
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

  const handleEditChapter = async () => {
    if (currentChapter) {
      setChapters(
        chapters.map((chapter) =>
          chapter.id === currentChapter.id ? currentChapter : chapter
        )
      );
      closeEditModal();
    }
  };

  const handleAddChapter = async () => {
    const newId = (
      Number.parseInt(chapters[chapters.length - 1].id) + 1
    ).toString();
    const newSerialNo = chapters.length + 1;
    const fullNewChapter: Chapter = {
      id: newId,
      serialNo: newSerialNo,
      courseId: "CS001",
      name: newChapter.name || "",
      description: newChapter.description || "",
      image: newChapter.image || "/placeholder.svg?height=40&width=40",
      video: newChapter.video || null,
      isListed: false,
    };
    setChapters([...chapters, fullNewChapter]);
    closeAddModal();
  };

  const handleFileChange = async (
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

  return (
    <div className="mx-auto p-4 w-full min-h-screen flex justify-center bg-black ">
      <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden w-full max-w-4xl">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-50">
            Chapter Management
          </h1>
          <p className="text-sm text-gray-50">Manage your Chapters</p>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <button
              onClick={openAddModal}
              className="bg-purple-400 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
            >
              Add Chapter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-3 border-b border-gray-200">S.No</th>
                  <th className="p-3 border-b border-gray-200">Course ID</th>
                  <th className="p-3 border-b border-gray-200">Image</th>
                  <th className="p-3 border-b border-gray-200">Chapter Name</th>
                  <th className="p-3 border-b border-gray-200">Video</th>
                  <th className="p-3 border-b border-gray-200">Status</th>
                  <th className="p-3 border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {chapters.map((chapter) => (
                  <tr key={chapter.id} className="text-gray-50">
                    <td className="p-3 border-b border-gray-200">
                      {chapter.serialNo}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      {chapter.courseId}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <div className="relative h-10 w-10">
                        <Image
                          src={"/default-profile.jpg"}
                          alt={`${chapter.name} thumbnail`}
                          width={50}
                          height={50}
                          className="rounded-md object-cover w-full h-full"
                        />
                      </div>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      {chapter.name}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      {chapter.video ? (
                        <span className="text-green-500">Uploaded</span>
                      ) : (
                        <span className="text-red-500">Not uploaded</span>
                      )}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <button
                        onClick={() => handleToggleStatus(chapter.id)}
                        className={`px-2 py-1 rounded text-xs ${
                          chapter.isListed
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-700"
                        }`}
                      >
                        {chapter.isListed ? "Listed" : "Unlisted"}
                      </button>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(chapter)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(chapter.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Chapter Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Chapter</h2>
            <p className="mb-4 text-gray-600">
              Make changes to the chapter details here. Click save when you're
              done.
            </p>
            {currentChapter && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    value={currentChapter.name}
                    onChange={(e) =>
                      setCurrentChapter({
                        ...currentChapter,
                        name: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={currentChapter.description}
                    onChange={(e) =>
                      setCurrentChapter({
                        ...currentChapter,
                        description: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="video"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Video
                  </label>
                  <input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, false)}
                    className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  />
                </div>
                {currentChapter.video && (
                  <div>
                    <p className="text-sm text-gray-500">
                      Current video: {currentChapter.video.name}
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleEditChapter}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add New Chapter</h2>
            <p className="mb-4 text-gray-600">
              Enter the details for the new chapter. Click add when you're done.
            </p>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="new-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  id="new-name"
                  value={newChapter.name || ""}
                  onChange={(e) =>
                    setNewChapter({ ...newChapter, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label
                  htmlFor="new-description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="new-description"
                  value={newChapter.description || ""}
                  onChange={(e) =>
                    setNewChapter({
                      ...newChapter,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label
                  htmlFor="new-video"
                  className="block text-sm font-medium text-gray-700"
                >
                  Video
                </label>
                <input
                  id="new-video"
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, true)}
                  className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={closeAddModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleAddChapter}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
