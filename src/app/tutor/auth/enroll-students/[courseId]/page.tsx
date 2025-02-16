"use client";

import { use, useEffect, useState } from "react";
import Pagination from "@/app/components/common/pagination";
import { MessageCircle, MessageCircleHeart } from "lucide-react";
import { useRouter } from "next/navigation";
import { getEnrollStudents } from "@/api/tutor";
import Cookies from "js-cookie";
import Link from "next/link";

interface CourseProgress {
  courseId: string;
  progress: number;
  completedChapters: string[];
  _id: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  courseProgress: CourseProgress[];
  // ...other student properties
}

export default function EnrollStudents({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  // Using the course id from the route params
  const { courseId } = use(params);
  const router = useRouter();
  const token = Cookies.get("jwt_token");

  const [students, setStudents] = useState<Student[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    getEnrollStudents(courseId, token)
      .then((response) => {
        const enrolledStudents: Student[] = response;
        setStudents(enrolledStudents);
      })
      .catch((error) => {
        console.error("Error fetching enrolled students:", error);
      });
  }, [courseId, token]);

  // Pagination logic
  const indexOfLastStudent = currentPage * itemsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - itemsPerPage;
  const currentStudents = students.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getCourseProgressForStudent = (student: Student) => {
    const progresses = student.courseProgress.filter(
      (cp) => cp.courseId === courseId
    );
    if (progresses.length === 0) return null;
    return progresses.reduce((prev, curr) =>
      curr.progress > prev.progress ? curr : prev
    );
  };

  return (
    <div className="mx-auto p-4 w-full h-screen flex justify-center bg-black">
      <div className="bg-gray-800 h-max shadow-md rounded-lg overflow-hidden w-8/12">
        <div className="p-6 bg-gray-800 border-b">
          <h1 className="text-2xl font-bold text-gray-100">
            Enrolled Students
          </h1>
          <p className="text-sm text-gray-100">
            List of students enrolled in this course.
          </p>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <button
              className="bg-purple-500 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded"
              onClick={() => router.back()}
            >
              Go Back
            </button>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar pb-5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-3 border-b">S.No</th>
                  <th className="p-3 border-b">Name</th>
                  <th className="p-3 border-b">Completed Chapters</th>
                  <th className="p-3 border-b hidden sm:table-cell">Status</th>
                  <th className="p-3 border-b">
                    <MessageCircleHeart className="w-5 h-5" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((student, index) => {
                  const progress = getCourseProgressForStudent(student);
                  const completedChapters = progress
                    ? progress.completedChapters.length
                    : 0;
                  const status =
                    progress && progress.progress === 100
                      ? "Completed"
                      : "Pending";

                  return (
                    <tr key={student._id} className="text-gray-50">
                      <td className="p-3 border-b">
                        {index + 1 + indexOfFirstStudent}
                      </td>
                      <td className="p-3 border-b">{student.name}</td>
                      <td className="p-3 border-b">{completedChapters}</td>
                      <td className="p-3 border-b hidden sm:table-cell">
                        {status === "Completed" ? (
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full">
                            {status}
                          </span>
                        ) : (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full">
                            {status}
                          </span>
                        )}
                      </td>
                      <td className="p-3 border-b">
                        <Link href={`/tutor/auth/message/${student._id}`}>
                          <p>
                            <MessageCircle className="w-5 h-5 text-white" />
                          </p>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination
              totalPages={Math.ceil(students.length / itemsPerPage)}
              onPageChange={paginate}
              currentPage={currentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
