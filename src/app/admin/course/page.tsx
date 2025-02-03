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
const CourseLists = () => {
  interface Course {
    _id: string;
    courseId: string;
    courseName: string;
    thumbnail: string;
    price: number;
    isVisible: boolean;
  }

  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const coursesPerPage = 5;
  const token = Cookies.get("jwt_token") || "";
  useEffect(() => {
    getCourseDataByAdmin(token)
      .then((data) => {
        console.log(data);
        setCourses(data);
        setFilteredCourses(data);
        showToast("Course data fetched successfully", "success");
      })
      .catch((err) => {
        console.error("Failed to fetch course data:", err);
        showToast("Failed to fetch course data", "error");
      });
  }, [token]);
  const listCourse = async (courseId: string) => {
    try {
      const token = Cookies.get("jwt_token");
      const response = await fetch(
        `${backendUrl}/admin/list-course/${courseId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setCourses((prevCourses) => {
          const updatedCourses = prevCourses.map((course) =>
            course.courseId === courseId
              ? { ...course, isVisible: true }
              : course
          );
          setFilteredCourses(updatedCourses);
          return updatedCourses;
        });

        showToast("Course listed successfully", "success");
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast("Failed to list course", "error");
      console.error(err);
    }
  };
  const unlistCourse = async (courseId: string) => {
    try {
      const token = Cookies.get("jwt_token");
      const response = await fetch(
        `${backendUrl}/admin/unlist-course/${courseId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setCourses((prevCourses) => {
          const updatedCourses = prevCourses.map((course) =>
            course.courseId === courseId
              ? { ...course, isVisible: false }
              : course
          );
          setFilteredCourses(updatedCourses);
          return updatedCourses;
        });

        showToast("Course unlisted successfully", "success");
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast("Failed to unlist course", "error");
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
    <div className="container mx-auto p-4 text-center flex justify-center items-center flex-col h-screen">
      <h1 className="text-2xl font-bold my-4">Course List</h1>
      <Search searchTerm={searchTerm} onSearch={handleSearch} />
      <table className="w-4/5 table-auto border-collapse border border-gray-300 text-center">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">S.no</th>
            <th className="border px-4 py-2">Course ID</th>
            <th className="border px-4 py-2">Course Name</th>
            <th className="border px-4 py-2">Thumbnail</th>
            <th className="border px-4 py-2">Price</th>
            <th className="border px-4 py-2">Chapters</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentCourses.map((course, index) => (
            <tr key={course._id}>
              <td className="border px-4 py-2">{index + 1}</td>
              <td className="border px-4 py-2">{course.courseId}</td>
              <td className="border px-4 py-2">{course.courseName}</td>
              <td className="border px-4 py-2">
                <Image
                  src={course.thumbnail || "/default-thumbnail.jpg"}
                  alt={course.courseName}
                  width={50}
                  height={50}
                  className="rounded"
                />
              </td>
              <td className="border px-4 py-2">${course.price}</td>
              <td className="border px-4 py-2 flex justify-center">
                <Link
                  href={`/admin/course/${course.courseId}`}
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
              <td className="border px-4 py-2">
                {course.isVisible ? "Listed" : "Unlisted"}
              </td>
              <td className="border px-4 py-2">
                {course.isVisible ? (
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => unlistCourse(course.courseId)}
                  >
                    Unlist
                  </button>
                ) : (
                  <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => listCourse(course.courseId)}
                  >
                    List
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default CourseLists;
