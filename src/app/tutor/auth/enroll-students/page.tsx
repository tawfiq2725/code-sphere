"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { getCourseData } from "@/api/course";
import { Link2 } from "lucide-react";
import Pagination from "@/app/components/common/pagination";
import { getEnrollStudents } from "@/api/tutor";

interface Course {
  serialNo: number;
  courseId: string;
  courseName: string;
  courseDescription: string;
  info: string;
  thumbnail: string;
  thumbnailFile: File | null;
  price: number;
  prerequisites: string;
  isListed: boolean;
  courseStatus: string;
  categoryName: string;
}

interface CourseWithEnrollment extends Course {
  enrollmentCount: number;
}

export default function SimpleCourseManagement() {
  const token: any = Cookies.get("jwt_token");
  const router = useRouter();
  const [courses, setCourses] = useState<CourseWithEnrollment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const tutorId: string = localStorage.getItem("tutor_id") || "";

  useEffect(() => {
    // Fetch courses first
    getCourseData(token, tutorId)
      .then(async (res) => {
        const coursesData: Course[] = res.data;
        // For each course, fetch the enrollment count.
        const coursesWithEnrollment = await Promise.all(
          coursesData.map(async (course) => {
            try {
              const enrolledStudents = await getEnrollStudents(
                course.courseId,
                token
              );
              return { ...course, enrollmentCount: enrolledStudents.length };
            } catch (error) {
              console.error(
                `Error fetching enrollments for course ${course.courseId}:`,
                error
              );
              return { ...course, enrollmentCount: 0 };
            }
          })
        );
        setCourses(coursesWithEnrollment);
      })
      .catch((error) => {
        console.error("Error fetching course data:", error);
      });
  }, [token, tutorId]);

  // Pagination logic
  const indexOfLastCourse = currentPage * itemsPerPage;
  const indexOfFirstCourse = indexOfLastCourse - itemsPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="mx-auto p-4 w-full h-screen flex justify-center bg-black">
      <div className="bg-gray-800 h-max shadow-md rounded-lg overflow-hidden w-8/12">
        <div className="p-6 bg-gray-800 border-b">
          <h1 className="text-2xl font-bold text-gray-100">Enroll Students</h1>
          <p className="text-sm text-gray-100">
            Manage your courses, enrollment counts, and visibility.
          </p>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <button
              className="bg-purple-500 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded"
              onClick={() => router.push("/tutor/auth/courses/add-course")}
            >
              Add Course
            </button>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar pb-5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-3 border-b">S.No</th>
                  <th className="p-3 border-b">Course ID</th>
                  <th className="p-3 border-b">Name</th>
                  <th className="p-3 border-b hidden md:table-cell">Image</th>
                  <th className="p-3 border-b">Enrolled</th>
                  <th className="p-3 border-b">Chapters</th>
                  <th className="p-3 border-b hidden sm:table-cell">Status</th>
                  <th className="p-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCourses.map((course, index) => (
                  <tr key={course.courseId} className="text-gray-50">
                    <td className="p-3 border-b">{index + 1}</td>
                    <td className="p-3 border-b">{course.courseId}</td>
                    <td className="p-3 border-b">{course.courseName}</td>
                    <td className="p-3 border-b hidden md:table-cell">
                      <div className="relative h-10 w-20">
                        <Image
                          src={course.thumbnail || "/default-profile.jpg"}
                          alt={`${course.courseName} thumbnail`}
                          className="object-cover"
                          width={50}
                          height={50}
                        />
                      </div>
                    </td>
                    {/* Show enrollment count instead of price */}
                    <td className="p-3 border-b">{course.enrollmentCount}</td>
                    <td className="p-3 border-b">
                      <Link
                        href={`/tutor/auth/courses/${course.courseId}`}
                        passHref
                        className="text-center flex justify-center"
                        onClick={() => {
                          localStorage.setItem("thumbnail", course.thumbnail);
                          localStorage.setItem("courseName", course.courseName);
                        }}
                      >
                        <Link2 />
                      </Link>
                    </td>
                    <td className="p-3 border-b hidden sm:table-cell">
                      <button
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          course.isListed
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {course.courseStatus}
                      </button>
                    </td>
                    <td className="p-3 border-b">
                      <div className="flex gap-2">
                        <Link
                          href={`/tutor/auth/enroll-students/${course.courseId}`}
                        >
                          <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-1 px-2 rounded text-xs">
                            Check
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              totalPages={Math.ceil(courses.length / itemsPerPage)}
              onPageChange={paginate}
              currentPage={currentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
