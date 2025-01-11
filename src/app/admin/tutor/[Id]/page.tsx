"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { showToast } from "@/utils/toastUtil";

interface Params {
  Id: string;
}

const TutorCertificates = ({ params }: { params: Promise<Params> }) => {
  const [Id, setId] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((resolvedParams) => setId(resolvedParams.Id));
  }, [params]);

  useEffect(() => {
    if (!Id) return;

    const fetchCertificates = async () => {
      try {
        const token = Cookies.get("jwt_token");
        const response = await fetch(
          `http://localhost:5000/admin/tutor/certificates/${Id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        console.log(data.data);
        if (data.success && Array.isArray(data.data)) {
          setCertificates(data.data);
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

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4 flex justify-center items-center flex-col">
      <h1 className="text-2xl font-bold mb-4">Certificates</h1>
      {certificates && certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((certificate, index) => (
            <div key={index} className="border p-4 rounded shadow">
              {certificate.endsWith(".pdf") ? (
                <div>
                  <embed
                    src={certificate}
                    type="application/pdf"
                    width="100%"
                    height="200px"
                  />
                  <a
                    href={certificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View Full PDF
                  </a>
                </div>
              ) : (
                <div>
                  <img
                    src={certificate}
                    alt={`Certificate ${index + 1}`}
                    className="w-full h-auto mb-2"
                  />
                  <a
                    href={certificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View Full Image
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No certificates available for this tutor.</p>
      )}
    </div>
  );
};

export default TutorCertificates;
