"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { showToast } from "@/utils/toastUtil";
import { backendUrl } from "@/utils/backendUrl";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Params {
  Id: string;
}

const TutorCertificates = ({ params }: { params: Promise<Params> }) => {
  const [Id, setId] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadedCertificates, setUploadedCertificates] = useState<string[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCertificateIndex, setCurrentCertificateIndex] = useState(0);
  const router = useRouter();
  const tutorId = localStorage.getItem("applicant-id");
  const token = Cookies.get("jwt_token");

  useEffect(() => {
    params.then((resolvedParams) => setId(resolvedParams.Id));
  }, [params]);

  useEffect(() => {
    if (!Id) return;

    const fetchCertificates = async () => {
      try {
        const token = Cookies.get("jwt_token");
        const response = await fetch(
          `${backendUrl}/admin/tutor/certificates/${Id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setUploadedCertificates(data.data);
          showToast("Certificates fetched successfully", "success");
        } else {
          showToast(data.message || "Unexpected response format", "error");
        }
      } catch (err) {
        showToast("Failed to fetch certificates", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [Id]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handlePrev = () => {
    setCurrentCertificateIndex((prev) =>
      prev === 0 ? uploadedCertificates.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentCertificateIndex((prev) =>
      prev === uploadedCertificates.length - 1 ? 0 : prev + 1
    );
  };

  const handleAccept = async () => {
    try {
      const response = await fetch(
        `${backendUrl}/admin/approve-tutor/${tutorId}`,
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
        showToast("Tutor accepted successfully", "success");
        router.back();
      } else {
        showToast(data.message, "error");
        router.back();
      }
    } catch (error) {}
  };

  const handleReject = async () => {
    try {
      const response = await fetch(
        `${backendUrl}/admin/disapprove-tutor/${tutorId}`,
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
        showToast("Tutor rejected successfully", "success");
        router.back();
      } else {
        showToast(data.message, "error");
        router.back();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-gray-900 text-white py-8">
      <div className="w-full max-w-2xl mx-4 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-white bg-clip-text text-transparent">
          Tutor Certificates Review
        </h1>

        <div className="mb-8 text-center">
          {uploadedCertificates.length > 0 ? (
            <button
              onClick={openModal}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-medium transition duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              View {uploadedCertificates.length} Certificate
              {uploadedCertificates.length !== 1 && "s"}
            </button>
          ) : (
            <p className="text-gray-400 italic">No certificates available</p>
          )}
        </div>

        <div className="bg-gray-700/50 p-6 rounded-lg border border-gray-600 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-6 text-center">
            Review Decision
          </h3>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg font-medium shadow-lg transition duration-300 transform hover:scale-105"
              onClick={handleAccept}
            >
              Accept Tutor
            </button>
            <button
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-lg font-medium shadow-lg transition duration-300 transform hover:scale-105"
              onClick={handleReject}
            >
              Reject Tutor
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-3xl w-full border border-gray-700 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Certificate {currentCertificateIndex + 1} of{" "}
                  {uploadedCertificates.length}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 bg-gray-900 min-h-[400px] flex items-center justify-center">
              {uploadedCertificates[currentCertificateIndex] && (
                <>
                  {uploadedCertificates[currentCertificateIndex].endsWith(
                    ".pdf"
                  ) ? (
                    <iframe
                      src={uploadedCertificates[currentCertificateIndex]}
                      title={`Certificate ${currentCertificateIndex + 1}`}
                      className="w-full h-[500px] border-none rounded-md"
                    ></iframe>
                  ) : uploadedCertificates[currentCertificateIndex].endsWith(
                      ".jpg"
                    ) ||
                    uploadedCertificates[currentCertificateIndex].endsWith(
                      ".jpeg"
                    ) ||
                    uploadedCertificates[currentCertificateIndex].endsWith(
                      ".png"
                    ) ? (
                    <div className="relative w-full h-[500px]">
                      <Image
                        src={uploadedCertificates[currentCertificateIndex]}
                        alt={`Certificate ${currentCertificateIndex + 1}`}
                        layout="fill"
                        objectFit="contain"
                        className="rounded-md"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-gray-800 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 mx-auto text-gray-500 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <p className="text-xl font-medium text-gray-300">
                        Unsupported file type:{" "}
                        {uploadedCertificates[currentCertificateIndex]
                          .split(".")
                          .pop()}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-between items-center p-6 border-t border-gray-700">
              <button
                onClick={handlePrev}
                className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition duration-300"
              >
                Close
              </button>
              <button
                onClick={handleNext}
                className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition duration-300"
              >
                Next
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorCertificates;
