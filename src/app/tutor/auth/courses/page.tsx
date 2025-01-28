"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { getCourseData } from "@/api/course";
import { showToast } from "@/utils/toastUtil";
import { backendUrl } from "@/utils/backendUrl";
import { ToastConfirm } from "@/app/components/common/Toast";
import { Link2 } from "lucide-react";
import Pagination from "@/app/components/common/pagination";
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
}

export default function SimpleCourseManagement() {
  const token: any = Cookies.get("jwt_token");
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    getCourseData(token)
      .then((data) => {
        console.log(data.data);
        setCourses(data.data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        console.log("Course data fetched successfully");
      });
  }, []);

  const handleEdit = (course: Course) => {
    setSelectedCourse({ ...course });
    setIsModalOpen(true);
  };

  const updateData = () => {
    const formdata = new FormData();
    if (selectedCourse?.courseName) {
      formdata.append("courseName", selectedCourse.courseName);
    }
    if (selectedCourse?.courseDescription) {
      formdata.append("courseDescription", selectedCourse.courseDescription);
    }
    if (selectedCourse?.info) {
      formdata.append("info", selectedCourse.info);
    }
    if (selectedCourse?.price) {
      formdata.append("price", selectedCourse.price.toString());
    }
    if (selectedCourse?.prerequisites) {
      formdata.append("prerequisites", selectedCourse.prerequisites);
    }
    if (selectedCourse?.thumbnailFile) {
      formdata.append("thumbnail", selectedCourse.thumbnailFile);
    }
    return formdata;
  };
  const courseId = selectedCourse?.courseId;
  const handlesubmitUpdateData = async () => {
    const formdata = updateData();
    try {
      const response = await fetch(
        `${backendUrl}/api/course/edit-course/${courseId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formdata,
        }
      );
      const data = await response.json();
      if (data.success) {
        console.log(data);
        showToast("Course updated successfully", "success");
        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course.courseId === selectedCourse?.courseId
              ? { ...selectedCourse }
              : course
          )
        );
        setIsModalOpen(false);
        router.push("/tutor/auth/courses");
      } else {
        console.error(data.message);
        showToast(data.message, "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Something wrong in the backend", "error");
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      const response = await fetch(
        `${backendUrl}/api/course/delete-course/${courseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete the course");
      }

      const data = await response.json();
      console.log(data);

      if (data.success) {
        showToast("Course deleted successfully", "success");
      } else {
        showToast(data.message || "Something went wrong", "error");
      }
    } catch (error) {
      console.error("Error while deleting course:", error);
      showToast("An error occurred while deleting the course", "error");
    }
  };

  const handleDelete = async (courseId: string) => {
    ToastConfirm({
      message: "Are you sure you want to delete this course?",
      onConfirm: () => {
        deleteCourse(courseId);
        setCourses((prev) =>
          prev.filter((course) => course.courseId !== courseId)
        );
      },
      onCancel: () => {
        console.log("Delete operation cancelled");
        showToast("Delete operation cancelled", "info");
      },
    });
  };

  return (
    <div className=" mx-auto p-4 w-full h-screen flex  justify-center bg-black">
      <div className="bg-gray-800 h-max  shadow-md rounded-lg overflow-hidden w-8/12">
        <div className="p-6 bg-gray-800 border-b">
          <h1 className="text-2xl font-bold text-gray-100">
            Course Management
          </h1>
          <p className="text-sm text-gray-100">
            Manage your courses, pricing, and visibility
          </p>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <button
              className="bg-purple-500 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                router.push("/tutor/auth/courses/add-course");
              }}
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
                  <th className="p-3 border-b">Price</th>
                  <th className="p-3 border-b ">Chapters</th>
                  <th className="p-3 border-b hidden sm:table-cell">Status</th>
                  <th className="p-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, index) => (
                  <tr key={course.courseId} className="text-gray-50">
                    <td className="p-3 border-b">{index + 1}</td>
                    <td className="p-3 border-b">{course.courseId}</td>
                    <td className="p-3 border-b">{course.courseName}</td>
                    <td className="p-3 border-b hidden md:table-cell">
                      <div className="relative h-10 w-20">
                        <Image
                          src={course.thumbnail || "/default-profile.jpg"}
                          alt={`${course.courseName} thumbnail`}
                          className=" object-cover"
                          width={50}
                          height={50}
                        />
                      </div>
                    </td>
                    <td className="p-3 border-b">${course.price}</td>
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
                      {isModalOpen && selectedCourse && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                          <div className="bg-black p-6 rounded-lg shadow-lg w-1/2  max-w-lg max-h-screen overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4 text-white">
                              Edit Course
                            </h2>
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                console.log("Updated course:", selectedCourse);
                                setIsModalOpen(false);
                                handlesubmitUpdateData();
                              }}
                            >
                              <div className="mb-4">
                                <label className="block text-white font-semibold">
                                  Course Name
                                </label>
                                <input
                                  type="text"
                                  value={selectedCourse.courseName}
                                  onChange={(e) =>
                                    setSelectedCourse({
                                      ...selectedCourse,
                                      courseName: e.target.value,
                                    })
                                  }
                                  className="w-full p-2 border rounded bg-gray-800 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                />
                              </div>
                              <div className="mb-4">
                                <label className="block text-white font-semibold">
                                  Course Description
                                </label>
                                <textarea
                                  value={selectedCourse.courseDescription || ""}
                                  onChange={(e) =>
                                    setSelectedCourse({
                                      ...selectedCourse,
                                      courseDescription: e.target.value,
                                    })
                                  }
                                  rows={4}
                                  className="w-full p-2 border rounded bg-gray-800 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                ></textarea>
                              </div>
                              <div className="mb-4">
                                <label className="block text-white font-semibold">
                                  Course Information
                                </label>
                                <textarea
                                  value={selectedCourse.info || ""}
                                  onChange={(e) =>
                                    setSelectedCourse({
                                      ...selectedCourse,
                                      info: e.target.value,
                                    })
                                  }
                                  rows={4}
                                  className="w-full p-2 border rounded bg-gray-800 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                ></textarea>
                              </div>
                              <div className="mb-4">
                                <label className="block text-white font-semibold">
                                  Price
                                </label>
                                <input
                                  type="number"
                                  value={selectedCourse.price}
                                  onChange={(e) =>
                                    setSelectedCourse({
                                      ...selectedCourse,
                                      price: Number.parseFloat(e.target.value),
                                    })
                                  }
                                  className="w-full p-2 border rounded bg-gray-800 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                />
                              </div>
                              <div className="mb-4">
                                <label className="block text-white font-semibold">
                                  Thumbnail
                                </label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const file = e.target.files[0];
                                      setSelectedCourse({
                                        ...selectedCourse,
                                        thumbnailFile: file,
                                      });
                                    }
                                  }}
                                  className="w-full p-2 border rounded bg-gray-800 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                />
                                {selectedCourse.thumbnail && (
                                  <div className="mt-2">
                                    <Image
                                      src={
                                        selectedCourse.thumbnail ||
                                        "/placeholder.svg"
                                      }
                                      alt="Thumbnail preview"
                                      width={100}
                                      height={100}
                                      className="rounded"
                                      priority
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="mb-4">
                                <label className="block text-white font-semibold">
                                  Prerequisites
                                </label>
                                <textarea
                                  value={selectedCourse.prerequisites || ""}
                                  onChange={(e) =>
                                    setSelectedCourse({
                                      ...selectedCourse,
                                      prerequisites: e.target.value,
                                    })
                                  }
                                  rows={4}
                                  className="w-full p-2 border rounded bg-gray-800 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                ></textarea>
                              </div>
                              <div className="flex justify-end gap-4">
                                <button
                                  type="button"
                                  onClick={() => setIsModalOpen(false)}
                                  className="bg-gray-300 px-4 py-2 rounded"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="bg-purple-500 text-white px-4 py-2 rounded"
                                >
                                  Save
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-1 px-2 rounded text-xs"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(course.courseId)}
                          className="bg-red-100 hover:bg-red-200 text-red-800 font-bold py-1 px-2 rounded text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination totalPages={5} onPageChange={5} currentPage={1} />
          </div>
        </div>
      </div>
    </div>
  );
}
