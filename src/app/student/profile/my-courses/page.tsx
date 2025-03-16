"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import { findUserById } from "@/api/user/user";
import { getCourses } from "@/api/course";
import { useSelector } from "react-redux";
import { signedUrltoNormalUrl } from "@/utils/presignedUrl";

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

  const userId = user.user._id;

  useEffect(() => {
    setIsLoading(true);

    Promise.all([findUserById(userId), getCourses()])
      .then(([userData, coursesData]) => {
        setEnrollData(userData.data.courseProgress || []);
        setCourseData(coursesData.data || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setIsLoading(false);
      });
  }, [userId]);
  for (const course of courseData) {
    let thumbnailUrl = signedUrltoNormalUrl(course.thumbnail);
    course.thumbnail = thumbnailUrl;
  }
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

          // Calculate progress ensuring it's a valid number between 0-100
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
    } else {
      setMergedCourses([]);
    }
  }, [courseData, enrollData]);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 md:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">My Courses</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {mergedCourses.length > 0 ? (
              mergedCourses.map((course) => (
                <div
                  key={course._id}
                  className="w-full max-w-sm bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold mb-2 line-clamp-1">
                      {course.courseName}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10">
                      {course.courseDescription}
                    </p>

                    <div className="flex justify-between items-center mb-4">
                      <Link
                        href={`/student/profile/my-courses/${course.courseId}`}
                        className="text-sm text-pink-400 hover:text-pink-300 font-medium"
                      >
                        Explore Course
                      </Link>
                      <span className="text-sm text-gray-300">
                        {course.duration}
                      </span>
                    </div>

                    {/* Improved Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(course.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-pink-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{course.completedChapters.length} completed</span>
                        <span>{course.totalChapters} total</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="mb-4 text-5xl">📚</div>
                <p className="text-xl text-gray-400 mb-2">
                  No enrolled courses found
                </p>
                <p className="text-sm text-gray-500">
                  Explore our course catalog to start your learning journey
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
