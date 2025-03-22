"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import { findUserById } from "@/api/user/user";
import { getCourses } from "@/api/course";
import { useSelector } from "react-redux";
import { signedUrltoNormalUrl } from "@/utils/presignedUrl";
import Pagination from "@/app/components/common/pagination";

export default function Courses() {
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
    categoryName: string;
  }

  interface EnrollCourse {
    courseId: string;
    progress: number;
    completedChapters: string[];
    totalChapters: number;
  }

  const { user } = useSelector((state: any) => state.auth);
  const [enrollData, setEnrollData] = useState<EnrollCourse[]>([]);
  const [courseData, setCourseData] = useState<Course[]>([]);
  const [mergedCourses, setMergedCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;
  const [paginatedCourses, setPaginatedCourses] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const userId = user.user._id;

  useEffect(() => {
    setIsLoading(true);

    Promise.all([findUserById(userId), getCourses()])
      .then(([userData, coursesData]) => {
        setEnrollData(userData.data.courseProgress || []);
        const transformedCourses = (coursesData.data || []).map(
          (course: Course) => ({
            ...course,
            thumbnail: signedUrltoNormalUrl(course.thumbnail),
          })
        );
        setCourseData(transformedCourses);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setIsLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    if (courseData.length > 0 && enrollData.length > 0) {
      const enrolledCourses = courseData
        .filter((course) =>
          enrollData.some((e) => e.courseId === course.courseId)
        )
        .map((course) => {
          const enrolledCourse = enrollData.find(
            (e) => e.courseId === course.courseId
          );
          let progress = 0;
          if (enrolledCourse && enrolledCourse.totalChapters > 0) {
            progress = Math.min(
              Math.max(
                (enrolledCourse.completedChapters.length /
                  enrolledCourse.totalChapters) *
                  100,
                0
              ),
              100
            );
          }

          return {
            ...course,
            progress,
            completedChapters: enrolledCourse?.completedChapters || [],
            totalChapters: enrolledCourse?.totalChapters || 0,
          };
        });

      setMergedCourses(enrolledCourses);
      setTotalPages(Math.ceil(enrolledCourses.length / coursesPerPage));
    } else {
      setMergedCourses([]);
      setTotalPages(1);
    }
  }, [courseData, enrollData]);

  // Handle pagination
  useEffect(() => {
    if (mergedCourses.length > 0) {
      const indexOfLastCourse = currentPage * coursesPerPage;
      const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
      setPaginatedCourses(
        mergedCourses.slice(indexOfFirstCourse, indexOfLastCourse)
      );
    } else {
      setPaginatedCourses([]);
    }
  }, [mergedCourses, currentPage]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-purple-900/20 to-pink-900/20 blur-3xl pointer-events-none"></div>

      <main className="container mx-auto px-4 md:px-8 py-12 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-white">
            My Learning Journey
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Track your progress and continue learning where you left off
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-700 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-pink-500 border-l-purple-500 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paginatedCourses.length > 0 ? (
                paginatedCourses.map((course) => (
                  <div
                    key={course._id}
                    className="group bg-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-pink-500/20 transition-all duration-500 border border-gray-800 hover:border-pink-500/50 flex flex-col h-full transform hover:-translate-y-1"
                  >
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={course.thumbnail}
                        alt={course.courseName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-70"></div>
                    </div>

                    <div className="p-5 flex-grow flex flex-col">
                      <h3 className="text-xl font-bold mb-2 line-clamp-1 text-white group-hover:text-pink-400 transition-colors duration-300">
                        {course.courseName}
                      </h3>
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10">
                        {course.courseDescription}
                      </p>

                      <div className="mt-auto">
                        <div className="flex justify-between text-sm text-gray-300 mb-1.5">
                          <span>Progress</span>
                          <span className="font-semibold text-purple-400">
                            {Math.round(course.progress)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-2 mb-4">
                          <span>
                            {course.completedChapters.length} completed
                          </span>
                          <span>{course.totalChapters} chapters</span>
                        </div>

                        <Link
                          href={`/student/profile/my-courses/${course.courseId}`}
                          className="inline-block w-full text-center bg-purple-600 hover:from-pink-500 hover:to-purple-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-pink-500/30"
                        >
                          Continue Learning
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-gray-900/40 rounded-2xl border border-gray-800 backdrop-blur-sm">
                  <div className="mb-6 text-6xl">📚</div>
                  <p className="text-2xl text-gray-200 mb-3 font-medium">
                    No enrolled courses found
                  </p>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Explore our course catalog to start your learning journey
                    and track your progress here.
                  </p>
                  <Link
                    href="/student/courses"
                    className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-500 hover:to-purple-600 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-pink-500/30 font-medium"
                  >
                    Browse Courses
                  </Link>
                </div>
              )}
            </div>

            {/* Pagination component */}
            {mergedCourses.length > coursesPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </main>

      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-700/10 rounded-full blur-3xl -z-10"></div>
      <div className="fixed top-1/4 left-0 w-64 h-64 bg-pink-700/10 rounded-full blur-3xl -z-10"></div>
    </div>
  );
}
