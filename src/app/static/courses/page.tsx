"use client";

import React, { useEffect, useState } from "react";
import Header from "@/app/components/header";
import Link from "next/link";
import { getCourses } from "@/api/course";

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
  }

  const [courseData, setCourseData] = useState<Course[]>([]);
  const [filter, setFilter] = useState("All Courses");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getCourses().then((data) => {
      setCourseData(data.data);
    });
  }, []);

  const filteredCourses = courseData.filter(
    (course) =>
      (filter === "All Courses" || course.category === filter) &&
      course.courseName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className=" mx-auto px-20 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
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
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option>All Courses</option>
            <option>Web Development</option>
            <option>Programming</option>
            <option>Database</option>
          </select>

          <div className="flex gap-4 mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Search Courses"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 p-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Link
              href="/static/courses"
              className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              All Courses
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              className=" w-80 bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-200"
            >
              <img
                src={course.thumbnail}
                alt={course.courseName}
                className="w-full h-48 object-cover hover:scale-110 overflow-hidden transition-transform"
              />
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{course.courseName}</h3>
                <p className="text-sm text-gray-400 mb-4">
                  {course.courseDescription}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-pink-500">
                    <Link href={`/static/courses/${course.courseId}`}>
                      Explore Course
                    </Link>
                  </span>
                  <span className="text-sm text-gray-300">
                    {course.duration}
                  </span>
                  <span className="text-sm font-semibold text-pink-500">
                    ${course.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
