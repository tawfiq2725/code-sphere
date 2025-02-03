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
        console.log("------------------------------------");

        console.log(data);
        console.log(data.data);
        console.log("------------------------------------");
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
    return <p>Loading...</p>;
  }

  return (
    <div className="w-full h-screen flex justify-center items-center flex-col">
      <div className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Certificates</h1>

        <div className="mb-6">
          <button
            onClick={openModal}
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            View Certificates
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Confirmation
          </h3>
          <div className="flex justify-between items-center">
            <button
              className="mx-3 px-6 py-2 text-white bg-green-500 hover:bg-green-600 rounded-lg font-medium shadow-sm transition duration-200"
              onClick={handleAccept}
            >
              Accept
            </button>
            <button
              className=" mx-3 px-6 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg font-medium shadow-sm transition duration-200"
              onClick={handleReject}
            >
              Reject
            </button>
          </div>
        </div>
      </div>

      {/* dd */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Certificates</h2>
            <div className="relative">
              {/* Conditional Rendering for File Types */}
              {uploadedCertificates[currentCertificateIndex] && (
                <>
                  {uploadedCertificates[currentCertificateIndex].endsWith(
                    ".pdf"
                  ) ? (
                    <iframe
                      src={uploadedCertificates[currentCertificateIndex]}
                      title={`Certificate ${currentCertificateIndex + 1}`}
                      className="w-full h-96"
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
                    <Image
                      src={uploadedCertificates[currentCertificateIndex]}
                      alt={`Certificate ${currentCertificateIndex + 1}`}
                      width={400}
                      height={300}
                      objectFit="contain"
                    />
                  ) : (
                    <p className="text-center">
                      Unsupported file type:{" "}
                      {uploadedCertificates[currentCertificateIndex]
                        .split(".")
                        .pop()}
                    </p>
                  )}
                </>
              )}
              <button
                onClick={handlePrev}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-l"
              >
                &#8249;
              </button>
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-r"
              >
                &#8250;
              </button>
            </div>
            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default TutorCertificates;
