"use client";

import React, { useState } from "react";
import { backendUrl } from "@/utils/backendUrl";
import Cookies from "js-cookie";
import { showToast } from "@/utils/toastUtil";
import { useRouter } from "next/navigation";

export default function AddCourseForm() {
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [price, setPrice] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [prerequisites, setPrerequisites] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const router = useRouter();

  const tutorId: any = localStorage.getItem("tutor_id");
  const token: any = Cookies.get("jwt_token");
  const resetForm = () => {
    setCourseName("");
    setCourseDescription("");
    setPrice("");
    setThumbnailFile(null);
    setPrerequisites("");
    setSubmitMessage("");
  };

  interface CourseFormData {
    courseName: string;
    courseDescription: string;
    price: string;
    prerequisites: string;
    thumbnail?: File;
    tutorId: string | null;
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("courseName", courseName);
    formData.append("courseDescription", courseDescription);
    formData.append("price", price);
    formData.append("prerequisites", prerequisites);
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }
    formData.append("tutorId", tutorId);

    try {
      const response = await fetch(`${backendUrl}/api/course/add-course`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        showToast(data.message, "success");
        resetForm();
        router.back();
      } else {
        showToast(data.message, "error");
        router.push("tutor/auth/courses");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitMessage("An error occurred while adding the course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black p-5">
      <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          Add New Course
        </h2>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="courseName"
              className="block text-sm font-medium text-gray-100 mb-1"
            >
              Course Name
            </label>
            <input
              id="courseName"
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full px-3 py-2 border bg-gray-800 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500
                         transition-all duration-200 border-gray-300 rounded-md"
              placeholder="Enter course name"
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="courseDescription"
              className="block text-sm font-medium text-gray-100 mb-1"
            >
              Course Description
            </label>
            <textarea
              id="courseDescription"
              autoComplete="off"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              className="w-full px-3 py-2 border bg-gray-800 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500
                         transition-all duration-200 border-gray-300 rounded-md"
              rows={4}
              placeholder="Enter a detailed description of your course"
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-100 mb-1"
            >
              Price
            </label>
            <input
              id="price"
              type="number"
              autoComplete="off"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border bg-gray-800 text-white border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500
                         transition-all duration-200 rounded-md"
              placeholder="Enter course price"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label
              htmlFor="thumbnailFile"
              className="block text-sm font-medium text-gray-100 mb-1"
            >
              Thumbnail Image
            </label>
            <input
              id="thumbnailFile"
              type="file"
              autoComplete="off"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) {
                  setThumbnailFile(e.target.files[0]);
                }
              }}
              className="w-full px-3 py-2 border bg-gray-800 text-white border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500
                         transition-all duration-200 rounded-md"
            />
          </div>

          <div>
            <label
              htmlFor="prerequisites"
              className="block text-sm font-medium text-gray-100 mb-1"
            >
              Prerequisites
            </label>
            <input
              id="prerequisites"
              type="text"
              value={prerequisites}
              autoComplete="off"
              onChange={(e) => setPrerequisites(e.target.value)}
              className="w-full px-3 py-2 border bg-gray-800 text-white border-gray-300 rounded-md focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500
                         transition-all duration-200"
              placeholder="Enter course prerequisites"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Adding Course..." : "Add Course"}
          </button>
        </form>
      </div>
    </div>
  );
}
