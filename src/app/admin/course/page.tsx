"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { showToast } from "@/utils/toastUtil";
import Pagination from "@/app/components/common/pagination";
import Search from "@/app/components/common/search";
import { backendUrl } from "@/utils/backendUrl";
import Image from "next/image";
import { getCourseDataByAdmin } from "@/api/course";
import { Link2 } from "lucide-react";
import Link from "next/link";
import api from "@/api/axios";

const CourseLists = () => {
  interface Course {
    _id: string;
    courseId: string;
    courseName: string;
    thumbnail: string;
    price: number;
    sellingPrice: number;
    isVisible: boolean;
    courseStatus: string;
  }

  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const coursesPerPage = 5;

  useEffect(() => {
    setIsLoading(true);
    getCourseDataByAdmin()
      .then((data) => {
        console.log(data);
        setCourses(data);
        setFilteredCourses(data);
      })
      .catch((err) => {
        console.error("Failed to fetch course data:", err);
        showToast("Failed to fetch course data", "error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const toggleCourse = async (
    courseId: string,
    isCurrentlyVisible: boolean
  ) => {
    try {
      const response = await api.patch(`/admin/toggle-course/${courseId}`, {
        isVisble: !isCurrentlyVisible,
      });

      const data = await response.data;
      if (data.success) {
        setCourses((prevCourses) => {
          const updatedCourses = prevCourses.map((course) =>
            course.courseId === courseId
              ? { ...course, isVisible: !isCurrentlyVisible }
              : course
          );
          if (searchTerm.trim() === "") {
            setFilteredCourses(updatedCourses);
          } else {
            setFilteredCourses(
              updatedCourses.filter(
                (course) =>
                  course.courseName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  course.courseId
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              )
            );
          }
          return updatedCourses;
        });

        showToast(
          `Course ${isCurrentlyVisible ? "unlisted" : "listed"} successfully`,
          "success"
        );
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast(
        `Failed to ${isCurrentlyVisible ? "unlist" : "list"} course`,
        "error"
      );
      console.error(err);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setFilteredCourses(courses);
    } else {
      const lowercasedTerm = term.toLowerCase();
      setFilteredCourses(
        courses.filter(
          (course) =>
            course.courseName.toLowerCase().includes(lowercasedTerm) ||
            course.courseId.toLowerCase().includes(lowercasedTerm)
        )
      );
    }
    setCurrentPage(1);
  };

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(
    indexOfFirstCourse,
    indexOfLastCourse
  );
  console.log(currentCourses);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 pt-10">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Course Management
          </h1>
          <p className="text-gray-400">View and manage course listings</p>
          <div className="w-full max-w-md">
            <Search searchTerm={searchTerm} onSearch={handleSearch} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : currentCourses.length > 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700/70 text-gray-300 text-sm uppercase">
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      S.No
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Course ID
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Course Name
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Thumbnail
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Selling Price
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Chapters
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentCourses.map((course, index) => (
                    <tr
                      key={course._id}
                      className="border-b border-gray-700 hover:bg-gray-700/40 transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                        {course.courseId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white font-medium">
                        {course.courseName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                        <div className="flex items-center justify-center">
                          <Image
                            src={course.thumbnail || "/default-thumbnail.jpg"}
                            alt={course.courseName}
                            width={50}
                            height={50}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                        ₹{course.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                        ₹{course.sellingPrice ?? "Not specified"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Link
                          href={`/admin/course/${course.courseId}`}
                          passHref
                          className="text-center flex justify-center items-center text-purple-400 hover:text-purple-300 transition-colors"
                          onClick={() => {
                            localStorage.setItem("thumbnail", course.thumbnail);
                            localStorage.setItem(
                              "courseName",
                              course.courseName
                            );
                            localStorage.setItem(
                              "courseStatus",
                              course.courseStatus
                            );
                          }}
                        >
                          <Link2 size={18} />
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {course.isVisible ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">
                            Listed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm">
                            Unlisted
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          className={`px-4 py-2 rounded-lg font-medium transition duration-300 inline-flex items-center gap-2 ${
                            course.isVisible
                              ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                              : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          }`}
                          onClick={() =>
                            toggleCourse(course.courseId, course.isVisible)
                          }
                        >
                          {course.isVisible ? "Unlist" : "List"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 px-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <p className="text-xl font-semibold text-gray-300 mb-2">
              No Courses Found
            </p>
            <p className="text-gray-400 text-center max-w-md">
              There are currently no courses matching your search criteria.
            </p>
          </div>
        )}

        {filteredCourses.length > coursesPerPage && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseLists;
