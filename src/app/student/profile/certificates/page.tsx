"use client";

import { useEffect, useState } from "react";
import { Download, Award, Loader2 } from "lucide-react";
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
      completedDate?: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: any) => state.auth);
  const userId = user?.user?._id;

  useEffect(() => {
    const fetchCertifications = async () => {
      if (!userId) {
        setLoading(false);
        setError("User authentication required");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get certificate data
        const certData = await getUserCertficates(userId);

        if (!certData || !Array.isArray(certData) || certData.length === 0) {
          setCertifications([]);
          setLoading(false);
          return;
        }

        // Process course data one by one to avoid Promise.all failures
        const updatedCertifications = [];

        for (const cert of certData) {
          try {
            const courseData = await getCourseById(cert.courseId);

            if (courseData) {
              updatedCertifications.push({
                ...cert,
                courseName: courseData.courseName || "Unknown Course",
                coursePic: courseData.thumbnail || "/placeholder-course.jpg",
                completedDate: new Date(
                  cert.approvedAt || Date.now()
                ).toLocaleDateString(),
              });
            }
          } catch (courseError) {
            console.error(
              `Error fetching course ${cert.courseId}:`,
              courseError
            );
            // Still add the certificate with default values
            updatedCertifications.push({
              ...cert,
              courseName: "Course information unavailable",
              coursePic: "/placeholder-course.jpg",
            });
          }
        }

        setCertifications(updatedCertifications);
      } catch (err) {
        console.error("Error fetching certifications:", err);
        setError("Failed to load certifications. Please try again later.");
        setCertifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, [userId]);

  const handleDownload = (url: string, courseName: string) => {
    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.download = `${courseName.replace(/\s+/g, "_")}_certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex justify-center p-6">
      <div className="w-full max-w-5xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl overflow-hidden border border-indigo-900/40">
        <div className="relative p-8 border-b border-gray-700 bg-gradient-to-r from-indigo-900/20 to-purple-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
          <div className="flex items-center space-x-3">
            <Award className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              My Certifications
            </h1>
          </div>
          <p className="text-sm text-gray-300 mt-2 ml-11">
            Track your achievements and download your earned certificates
          </p>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
              <p className="text-indigo-200">Loading your certifications...</p>
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-red-900/20 rounded-lg border border-red-700/30">
              <p className="text-red-300">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-700/30 hover:bg-red-700/50 rounded-lg text-white text-sm transition-all"
              >
                Try Again
              </button>
            </div>
          ) : certifications.length === 0 ? (
            <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700 px-6">
              <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                No Certifications Yet
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Complete courses to earn certificates that showcase your skills
                and accomplishments.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certifications.map((cert, index) => (
                <div
                  key={cert.courseId}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-indigo-700/50 transition-all shadow-lg hover:shadow-indigo-900/20 group"
                >
                  <div className="h-32 overflow-hidden relative">
                    <img
                      src={cert.coursePic || "/placeholder-course.jpg"}
                      alt={cert.courseName}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                    <div className="absolute bottom-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          cert.status === "approved"
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : cert.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                        }`}
                      >
                        {cert.status.charAt(0).toUpperCase() +
                          cert.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-lg text-white mb-2 line-clamp-2">
                      {cert.courseName}
                    </h3>

                    <div className="flex justify-between text-xs text-gray-400 mb-4">
                      <span>Certificate #{index + 1}</span>
                      {cert.completedDate && (
                        <span>Completed: {cert.completedDate}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-300">
                        {cert.approvedBy ? (
                          <span>
                            Approved by:{" "}
                            <span className="text-indigo-300">
                              {cert.approvedBy}
                            </span>
                          </span>
                        ) : (
                          <span>Pending approval</span>
                        )}
                      </div>

                      {cert.status === "approved" ? (
                        <button
                          onClick={() =>
                            cert.certificateUrl &&
                            handleDownload(cert.certificateUrl, cert.courseName)
                          }
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-lg shadow-blue-900/20"
                        >
                          <Download className="w-4 h-4" /> Download
                        </button>
                      ) : (
                        <span className="px-4 py-2 bg-gray-800 text-gray-500 rounded-lg text-sm">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
