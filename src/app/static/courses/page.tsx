"use client";

import React, { useEffect, useState } from "react";
import Header from "@/app/components/header";
import Link from "next/link";
import { getCourses } from "@/api/course";
import { getAllCategories } from "@/api/category";
import Pagination from "@/app/components/common/pagination";
import { getOffers } from "@/api/user/user";
import { signedUrltoNormalUrl } from "@/utils/presignedUrl";

export default function Courses() {
  interface Category {
    _id: string;
    categoryName: string;
  }

  interface Course {
    _id: string;
    courseName: string;
    courseDescription: string;
    duration: string;
    thumbnail: string;
    courseId: string;
    category: string;
    price: number;
    sellingPrice: number;
    categoryName: string; // This actually contains the category ID, not the name
    offerPrice?: number;
    actualCategoryName?: string;
    discountPercentage?: number;
  }

  interface Offer {
    _id: string;
    offerName: string;
    discount: number;
    categoryId: {
      _id: string;
      categoryName: string;
      status: boolean;
    };
    startsFrom: string;
    endsFrom: string;
    status: boolean;
  }

  const [courseData, setCourseData] = useState<Course[]>([]);
  const [processedCourses, setProcessedCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState("All Courses");
  const [search, setSearch] = useState("");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [coursesResponse, categoriesResponse, offersResponse] =
          await Promise.all([getCourses(), getAllCategories(), getOffers()]);

        if (coursesResponse && coursesResponse.data) {
          setCourseData(coursesResponse.data);
        }

        if (categoriesResponse) {
          setCategories(categoriesResponse);
        }
        console.log(offersResponse.data, "Tawfiq");
        // Extract offers data
        if (offersResponse && offersResponse.data && offersResponse.data) {
          setOffers(offersResponse.data);
          console.log("Offers loaded:", offersResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  for (let course of courseData) {
    course.thumbnail = signedUrltoNormalUrl(course.thumbnail);
  }
  // Process courses with offers and category names
  useEffect(() => {
    if (!courseData.length || !categories.length) return;

    console.log("Processing courses with offers");

    // Filter active offers
    const activeOffers = offers.filter((offer) => offer.status === true);

    console.log("Active offers:", activeOffers);

    const processed = courseData.map((course) => {
      // Get the category ID (either from category or categoryName field)
      const categoryId = course.categoryName;

      // Find matching category
      const category = categories.find((cat) => cat._id === categoryId);

      // Find matching offer for this category
      const matchingOffer = activeOffers.find(
        (offer) => offer.categoryId._id === categoryId
      );

      // Create the base processed course
      const processedCourse = {
        ...course,
        actualCategoryName: category
          ? category.categoryName
          : "Unknown Category",
      };

      // Apply offer if available
      if (matchingOffer) {
        console.log(
          `Applying offer to course ${course.courseName}:`,
          matchingOffer
        );

        // Calculate discounted price
        const discount = matchingOffer.discount;
        const discountAmount = (course.sellingPrice * discount) / 100;
        const discountedPrice = Math.floor(
          course.sellingPrice - discountAmount
        );

        processedCourse.offerPrice = discountedPrice;
        processedCourse.discountPercentage = discount;

        console.log(
          `Original price: ${course.sellingPrice}, Discount: ${discount}%, Final price: ${discountedPrice}`
        );
      }

      return processedCourse;
    });

    setProcessedCourses(processed);
  }, [courseData, categories, offers]);

  // Filter courses based on category and search
  const filteredCourses = processedCourses.filter(
    (course) =>
      (filter === "All Courses" || course.actualCategoryName === filter) &&
      course.courseName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const currentCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="mx-auto px-4 md:px-20 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
          </div>
        </main>
      </div>
    );
  }

  if (currentCourses.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="mx-auto px-4 md:px-20 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
              Level Up Your Coding Skills
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Whether you want to excel in web development, mobile development,
              or strengthen your fundamental software engineering skills, there
              is a course for you.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-5 items-center mb-8">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full md:w-auto"
            >
              <option value="All Courses">All Courses</option>
              {categories.map((category) => (
                <option key={category._id} value={category.categoryName}>
                  {category.categoryName}
                </option>
              ))}
            </select>

            <div className="flex gap-4 mt-4 md:mt-0 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search Courses"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-64 p-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="text-center py-16">
            <div className="text-3xl md:text-4xl font-bold mb-4">
              No Courses Found
            </div>
            <p className="text-gray-400">
              Try adjusting your search or filter settings
            </p>
            <Link
              href="/static/courses"
              className="mt-6 inline-block px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              View All Courses
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="mx-auto px-4 md:px-20 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
            Level Up Your Coding Skills
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Whether you want to excel in web development, mobile development, or
            strengthen your fundamental software engineering skills, there is a
            course for you.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-5 items-center mb-8">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full md:w-auto"
          >
            <option value="All Courses">All Courses</option>
            {categories.map((category) => (
              <option key={category._id} value={category.categoryName}>
                {category.categoryName}
              </option>
            ))}
          </select>

          <div className="flex gap-4 mt-4 md:mt-0 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search Courses"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 p-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Link
              href="/static/courses"
              className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              All Courses
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {currentCourses.map((course) => (
            <div
              key={course._id}
              className="w-full max-w-sm bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-purple-500/20 transition-shadow duration-300 border border-gray-700 hover:border-purple-500/50"
            >
              <div className="relative overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.courseName}
                  className="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-300"
                />
                {course.offerPrice && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    {course.discountPercentage}% OFF
                  </div>
                )}
              </div>
              <div className="p-4">
                <span className="inline-block px-2 py-1 rounded bg-purple-900 text-purple-200 text-xs mb-2">
                  {course.actualCategoryName || "Category"}
                </span>
                <h3 className="text-xl font-bold mb-2 line-clamp-1">
                  {course.courseName}
                </h3>
                <p className="text-sm text-gray-400 mb-4 h-10 line-clamp-2">
                  {course.courseDescription}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">
                    <i className="far fa-clock mr-1"></i> {course.duration}
                  </span>
                  <div className="text-right">
                    {course.offerPrice ? (
                      <>
                        <span className="text-sm line-through text-gray-400 mr-2">
                          ₹{course.sellingPrice}
                        </span>
                        <span className="text-sm font-semibold text-green-400">
                          ₹{course.offerPrice}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-gray-50">
                        ₹{course.sellingPrice}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/static/courses/${course.courseId}`}
                  className="mt-4 block w-full py-2 text-center rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-white font-medium"
                >
                  Explore Course
                </Link>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-10">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </main>
    </div>
  );
}
