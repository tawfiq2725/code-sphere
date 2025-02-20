"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import { findUserById } from "@/api/user/user";
import { getCourses } from "@/api/course"; // Fetch all courses
import { useSelector } from "react-redux";
import Cookies from "js-cookie";

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
  const [mergedCourses, setMergedCourses] = useState<any[]>([]); // Store only enrolled courses

  const token = Cookies.get("jwt_token");
  const userId = user.user._id;

  useEffect(() => {
    findUserById(userId)
      .then((data) => {
        setEnrollData(data.data.courseProgress || []);
      })
      .catch((err) => {
        console.log(err);
      });

    getCourses()
      .then((data) => {
        setCourseData(data.data || []);
      })
      .catch((err) => {
        console.log(err);
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
          const progress =
            enrolledCourse && enrolledCourse.totalChapters > 0
              ? (enrolledCourse.completedChapters.length /
                  enrolledCourse.totalChapters) *
                100
              : 0;
          return {
            ...course,
            progress,
          };
        });

      setMergedCourses(enrolledCourses);
    } else {
      setMergedCourses([]);
    }
  }, [courseData, enrollData]);

  console.log(mergedCourses, "Filtered enrolled courses");

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto px-20 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">My Courses</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mergedCourses.length > 0 ? (
            mergedCourses.map((course) => (
              <div
                key={course._id}
                className="w-80 bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-200"
              >
                <img
                  src={course.thumbnail}
                  alt={course.courseName}
                  className="w-full h-48 object-cover hover:scale-110 transition-transform"
                />
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">
                    {course.courseName}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {course.courseDescription}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-50">
                      <Link
                        href={`/student/profile/my-courses/${course.courseId}`}
                      >
                        Explore Course
                      </Link>
                    </span>
                    <span className="text-sm text-gray-300">
                      {course.duration}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-600 rounded-full h-2.5">
                      <div
                        className="bg-pink-500 h-2.5 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Progress: {Math.round(course.progress)}%
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 text-lg col-span-full">
              No enrolled courses found.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
