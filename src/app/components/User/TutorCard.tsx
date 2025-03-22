import { useState } from "react";
import Image from "next/image";
import { User } from "@/interface/user";

interface UserD {
  tutorData?: User;
}

export default function TutorCard({ tutorData }: UserD) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-gray-900/50 p-6 rounded-xl border border-purple-600/30 shadow-lg hover:shadow-purple-500/10 transition-all">
        <div className="flex flex-col">
          <h3 className="text-purple-400 font-medium text-sm uppercase tracking-wider mb-1">
            Tutor Details
          </h3>
          <h2 className="text-xl font-bold text-white mb-3">
            {tutorData?.name || "Tutor Name"}
          </h2>
          <p className="text-gray-400 mb-4">
            <span className="font-semibold text-purple-300">Email:</span>{" "}
            {tutorData?.email || "Not provided"}
          </p>
          <button
            className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <span>View Details</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 p-8 rounded-xl shadow-xl w-full max-w-md border border-purple-500/20 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              onClick={() => setIsModalOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="w-24 h-24 mb-6 mx-auto rounded-full overflow-hidden border-4 border-purple-600 shadow-lg">
              <Image
                src={tutorData?.profile || "/default-profile.jpg"}
                alt={tutorData?.name || "Tutor"}
                width={96}
                height={96}
                className="object-cover w-full h-full"
                priority
              />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3 text-center">
              <div className="flex justify-center gap-3">
                {tutorData?.name || "Tutor Name"}{" "}
                <div className="flex gap-2 justify-center mt-2">
                  {tutorData?.subjects?.map((subject, index) => (
                    <span
                      key={index}
                      className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </h2>

            <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
              {tutorData?.bio ? (
                <p className="text-gray-300 leading-relaxed">{tutorData.bio}</p>
              ) : (
                <p className="text-gray-400 text-center italic">
                  No bio provided.
                </p>
              )}
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-gray-300 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span className="font-medium text-purple-300">Email:</span>{" "}
                <span className="text-gray-400">
                  {tutorData?.email || "Not provided"}
                </span>
              </p>
            </div>

            <button
              className="mt-6 w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
