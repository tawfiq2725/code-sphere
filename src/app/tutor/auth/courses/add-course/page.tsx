"use client";

import React, { useState, useEffect } from "react";
import { backendUrl } from "@/utils/backendUrl";
import Cookies from "js-cookie";
import { showToast } from "@/utils/toastUtil";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function AddCourseForm() {
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [info, setInfo] = useState("");
  const [price, setPrice] = useState(0);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [prerequisites, setPrerequisites] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const tutorId: any = localStorage.getItem("tutor_id");
  const token: any = Cookies.get("jwt_token");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/course/get-categories`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCategories(response.data.data);
        console.log(response.data.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        showToast("Failed to load categories", "error");
      }
    };

    fetchCategories();
  }, [token]);

  const resetForm = () => {
    setCourseName("");
    setCourseDescription("");
    setInfo("");
    setPrice(0);
    setThumbnailFile(null);
    setPrerequisites("");
    setSelectedCategory("");
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !courseName ||
      !courseDescription ||
      !info ||
      !price ||
      !prerequisites ||
      !selectedCategory
    ) {
      return showToast("Please fill all the fields", "error");
    }
    const priceRegex = /^[0-9]+(\.[0-9]{1,2})?$/;
    const courseNameRegex = /^[a-zA-Z\s]+$/;
    const courseDescriptionRegex = /^[a-zA-Z.,\s]+$/;
    const infoRegex = /^[a-zA-Z.,\s]+$/;
    const prerequisitesRegex = /^[a-zA-Z.,\s]+$/;

    if (!priceRegex.test(price.toString())) {
      return showToast("Please enter a valid price", "error");
    }
    if (!courseNameRegex.test(courseName)) {
      return showToast("Please enter a valid course name", "error");
    }
    if (!courseDescriptionRegex.test(courseDescription)) {
      return showToast("Please enter a valid course description", "error");
    }
    if (!infoRegex.test(info)) {
      return showToast("Please enter a valid course information", "error");
    }
    if (!prerequisitesRegex.test(prerequisites)) {
      return showToast("Please enter a valid course prerequisites", "error");
    }
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("courseName", courseName);
    formData.append("courseDescription", courseDescription);
    formData.append("info", info);
    formData.append("price", price.toString());
    formData.append("prerequisites", prerequisites);
    formData.append("categoryName", selectedCategory);
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
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      showToast("An error occurred while adding the course.", "error");
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
          {/* Course Name */}
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
              className="w-full px-3 py-2 border bg-gray-800 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all duration-200 border-gray-300 rounded-md"
              placeholder="Enter course name"
              autoComplete="off"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-100 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border bg-gray-800 text-white border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all duration-200 rounded-md"
            >
              <option value="">Select a category</option>
              {categories.map((category: any) => (
                <option key={category._id} value={category._id}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Course Description */}
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
              className="w-full px-3 py-2 border bg-gray-800 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all duration-200 border-gray-300 rounded-md"
              rows={4}
              placeholder="Enter a detailed description of your course"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="info"
              className="block text-sm font-medium text-gray-100 mb-1"
            >
              Course Information
            </label>
            <textarea
              id="info"
              autoComplete="off"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              className="w-full px-3 py-2 border bg-gray-800 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500
                         transition-all duration-200 border-gray-300 rounded-md"
              rows={4}
              placeholder="Enter a detailed information of your course"
            ></textarea>
          </div>

          {/* Price */}
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
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border bg-gray-800 text-white border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all duration-200 rounded-md"
              placeholder="Enter course price"
              min="0"
            />
          </div>

          {/* Thumbnail Image */}
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
              className="w-full px-3 py-2 border bg-gray-800 text-white border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all duration-200 rounded-md"
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
          {/* Submit Button */}
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
