"use client";

import { useRef, useEffect, useState, use } from "react";
import Pagination from "@/app/components/common/pagination";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { getEnrollStudents } from "@/api/tutor";
import Cookies from "js-cookie";
import Link from "next/link";
import { toast } from "react-toastify";
import { ToastConfirm } from "@/app/components/common/Toast";
import Certificate from "@/app/components/Tutor/Certificate";
import Modal from "@/app/components/Tutor/canvas";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useSelector } from "react-redux";
import { set } from "nprogress";

interface CourseProgress {
  courseId: string;
  progress: number;
  completedChapters: string[];
  totalChapters: number;
  _id?: string;
}

interface UserCertificate {
  courseId: string;
  status: "approved" | "unavailable";
  certificateUrl?: string;
  issuedDate?: Date;
  approvedBy?: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  courseProgress: CourseProgress[];
  CourseCertificate?: UserCertificate[];
}

export default function EnrollStudents({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const router = useRouter();
  const token = Cookies.get("jwt_token") || "";
  const { user } = useSelector((state: any) => state.auth);

  const [students, setStudents] = useState<Student[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [tutorName, setTutorName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    if (courseId) {
      let course = localStorage.getItem("courseName");
      if (course) setCourseName(course);
      getEnrollStudents(courseId, token)
        .then((response) => {
          setStudents(response);
          console.log("Enrolled students:", response);
        })
        .catch((error) => {
          console.error("Error fetching enrolled students:", error);
        });
    }
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

  const openModal = (student: Student) => {
    setSelectedStudent(student);
    setTutorName("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
    setTutorName("");
  };

  const handleApproveCertificate = async () => {
    toast.info(
      <ToastConfirm
        message="Are you sure you want to approve this certificate?"
        onConfirm={async () => {
          toast.dismiss();

          const certificateElement = certificateRef.current;
          if (!certificateElement) {
            toast.error("Error: Certificate element not found");
            return;
          }

          try {
            setIsLoading(true);
            const canvas = await html2canvas(certificateElement);
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF();
            pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
            const pdfBlob = pdf.output("blob");
            const formData = new FormData();
            formData.append("pdf", pdfBlob, "certificate.pdf");
            formData.append("tutorName", user.user.name);
            if (selectedStudent) {
              formData.append("studentId", selectedStudent._id);
            }
            formData.append("courseId", courseId);

            const response = await fetch(
              "http://localhost:5000/tutor/api/approve-certificate",
              {
                method: "POST",
                body: formData,
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.ok) {
              toast.success("Certificate approved successfully");
              closeModal();
              setIsLoading(false);
            } else {
              toast.error("Error approving certificate");
            }
          } catch (error) {
            console.error("Error generating or sending certificate:", error);
            toast.error("Error approving certificate");
          }
        }}
        onCancel={() => {
          toast.dismiss();
        }}
      />,
      {
        position: "top-right",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        hideProgressBar: true,
      }
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
          <div className="mb-4 flex justify-between">
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
                  <th className="p-3 border-b text-center">Completed</th>
                  <th className="p-3 border-b text-center">Total Chapters</th>
                  <th className="p-3 border-b hidden sm:table-cell text-center">
                    Status
                  </th>
                  <th className="p-3 border-b text-center">Message</th>
                  <th className="p-3 border-b text-center">Certificate</th>
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
                  const certificate = student.CourseCertificate?.find(
                    (cert) => cert.courseId === courseId
                  );
                  const isApproved = certificate?.status === "approved";

                  return (
                    <tr key={student._id} className="text-gray-50">
                      <td className="p-3 border-b">
                        {index + 1 + indexOfFirstStudent}
                      </td>
                      <td className="p-3 border-b">{student.name}</td>
                      <td className="p-3 border-b text-center">
                        {completedChapters}
                      </td>
                      <td className="p-3 border-b text-center">
                        {progress ? progress.totalChapters : 0}
                      </td>
                      <td className="p-3 border-b hidden sm:table-cell text-center">
                        {status === "Completed" ? (
                          <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                            {status}
                          </span>
                        ) : (
                          <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                            {status}
                          </span>
                        )}
                      </td>
                      <td className="p-3 border-b">
                        <div className="flex justify-center items-center">
                          <Link href={`/tutor/auth/message`}>
                            <MessageCircle className="w-5 h-5 text-white" />
                          </Link>
                        </div>
                      </td>
                      <td className="p-3 border-b text-center">
                        {status === "Completed" && !isApproved ? (
                          <button
                            onClick={() => openModal(student)}
                            className="bg-purple-500 hover:bg-purple-700 text-white px-3 py-1 rounded"
                          >
                            Approve
                          </button>
                        ) : status === "Completed" && isApproved ? (
                          <span className="bg-green-500 text-white px-3 py-1 rounded">
                            Approved
                          </span>
                        ) : (
                          <span className="bg-gray-500 text-white px-3 py-1 rounded">
                            Pending
                          </span>
                        )}
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

      {/* Approval Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} isLoading={isLoading}>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">
            Approve Certificate for {selectedStudent?.name}
          </h2>
          <div>
            <label className="block text-gray-200 mb-2">
              Tutor Name:
              <input
                type="text"
                value={tutorName}
                onChange={(e) => setTutorName(e.target.value)}
                className="w-full p-2 mt-1 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your name"
              />
            </label>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-200 mb-2">
              Certificate Preview
            </h3>
            <div ref={certificateRef}>
              <Certificate
                studentName={selectedStudent?.name || ""}
                courseName={courseName || "Default Course"} // Use fetched course name
                tutorName={tutorName}
                date={new Date().toLocaleDateString()}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button
              onClick={closeModal}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleApproveCertificate}
              className="bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Approve
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
