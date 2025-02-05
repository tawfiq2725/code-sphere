"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { showToast } from "@/utils/toastUtil";
import { backendUrl } from "@/utils/backendUrl";

interface CourseActionProps {
  courseId: string;
}

const CourseAction = ({ courseId }: CourseActionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const router = useRouter();
  const token = Cookies.get("jwt_token") || "";

  const handleCourseAction = async (
    action: "approved" | "rejected",
    percent: number
  ) => {
    try {
      const payload = {
        courseStatus: action,
        percentage: percent,
      };
      console.log("Payload:", payload); // Logs your data as a plain object

      const response = await fetch(
        `${backendUrl}/admin/api/approve-or-reject-course/${courseId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (data.success) {
        showToast(`Course ${action}d successfully`, "success");
        setIsModalOpen(false);
        router.push("/admin/course");
      } else {
        showToast(data.message, "error");
        console.error("Error in course action:", data.message);
      }
    } catch (error) {
      console.error(`Error ${action}ing course:`, error);
      showToast(`An error occurred while ${action}ing the course`, "error");
    }
  };

  return (
    <div>
      <button
        className="bg-pink-500 hover:bg-pink-600 py-1 px-3 rounded-md transition duration-200"
        onClick={() => setIsModalOpen(true)}
      >
        Action
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative bg-gray-800 rounded-lg shadow-lg p-6 z-10 w-80">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-white">
              Confirm Action
            </h2>
            <div className="text-center my-3">
              <label className="text-white">Add your percentage </label>
              <input
                type="number"
                onChange={(e) => setPercentage(parseInt(e.target.value))}
                name="selling-price"
                className="text-black my-2 w-full py-2 px-3 rounded-md outline-none"
              />
            </div>
            <p className="mb-6 text-center text-white">
              Are you sure you want to perform this action on the course?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleCourseAction("rejected", 0)}
                className="w-20 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition duration-200"
              >
                Reject
              </button>
              <button
                onClick={() => handleCourseAction("approved", percentage)}
                className="w-20 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition duration-200"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseAction;
