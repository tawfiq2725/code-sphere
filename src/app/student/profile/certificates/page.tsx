"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { getUserCertficates } from "@/api/user/user";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import { getCourseById } from "@/api/tutor";

export default function StudentCertifications() {
  const [certifications, setCertifications] = useState<
    {
      courseId: string;
      courseName: string;
      coursePic: string;
      status: string;
      approvedBy: string;
      certificateUrl: string | null;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: any) => state.auth);
  const userId = user?.user?._id;
  const token = Cookies.get("jwt_token") || "";

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setLoading(true);
        // Step 1: Fetch user certificates
        const certData = await getUserCertficates(userId, token);
        if (!certData || !Array.isArray(certData)) {
          throw new Error("Invalid certificate data");
        }

        // Step 2: Fetch all course details concurrently
        const coursePromises = certData.map((cert) =>
          getCourseById(cert.courseId, token)
        );
        const courseDataArray = await Promise.all(coursePromises);

        // Step 3: Combine certificate data with course names in one go
        const updatedCertifications = certData.map((cert, index) => ({
          ...cert,
          courseName: courseDataArray[index]?.courseName,
          coursePic: courseDataArray[index]?.thumbnail,
        }));

        // Step 4: Update state once with the complete data
        setCertifications(updatedCertifications);
      } catch (err) {
        console.error("Error fetching certifications:", err);
        setCertifications([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchCertifications();
    }
  }, [userId, token]);

  const handleDownload = (url: string) => {
    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.download = "certificate.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-black flex justify-center p-6">
      <div className="w-full max-w-4xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        <div className="p-8 border-b border-gray-700">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            My Certifications
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Track and download your earned certificates
          </p>
        </div>
        <div className="p-8">
          {loading ? (
            <p className="text-white text-center">Loading certifications...</p>
          ) : certifications.length === 0 ? (
            <p className="text-white text-center">No certifications found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-white">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="p-4 font-semibold">S.No</th>
                    <th className="p-4 font-semibold">Image</th>
                    <th className="p-4 font-semibold">Course Name</th>
                    <th className="p-4 font-semibold text-center">Status</th>
                    <th className="p-4 font-semibold text-center">
                      Approved By
                    </th>
                    <th className="p-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {certifications.map((cert, index) => (
                    <tr
                      key={cert.courseId}
                      className="border-t border-gray-700 hover:bg-gray-800 transition-colors"
                    >
                      <td className="p-4">{index + 1}</td>
                      <td className="p-4">
                        <img
                          src={cert.coursePic}
                          alt={cert.courseName}
                          className="w-16 h-10 object-cover "
                        />
                      </td>
                      <td className="p-4">{cert.courseName}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            cert.status === "approved"
                              ? "bg-green-500/20 text-green-300"
                              : cert.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {cert.status.charAt(0).toUpperCase() +
                            cert.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {cert.approvedBy || "N/A"}
                      </td>
                      <td className="p-4 text-center">
                        {cert.status === "approved" ? (
                          <button
                            onClick={() =>
                              cert.certificateUrl &&
                              handleDownload(cert.certificateUrl)
                            }
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center gap-2 mx-auto"
                          >
                            <Download className="w-4 h-4" /> Download
                          </button>
                        ) : (
                          <span className="text-gray-500">Unavailable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
