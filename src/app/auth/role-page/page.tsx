"use client";
import { backendUrl } from "@/utils/backendUrl";
import { showToast } from "@/utils/toastUtil";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { getUserDetails, loginSuccess } from "@/store/slice/authSlice";
import api from "@/api/axios";
import { signedUrltoNormalUrl } from "@/utils/presignedUrl";
const page = () => {
  const router = useRouter();
  const [role, setRole] = React.useState("");
  const [email, setEmail] = React.useState("");
  const dispatch = useDispatch();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userEmail = params.get("email");

    if (userEmail) {
      setEmail(userEmail);
      localStorage.setItem("userEmail", email);
    }
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    const userId = localStorage.getItem("UserId");

    try {
      const response = await api.post("/auth/set-role", {
        role,
        userId,
      });
      const { data, message, success } = await response.data;
      localStorage.setItem("userEmail", data.email);

      if (success) {
        dispatch(
          loginSuccess({
            token: data.jwt_token,
            role: data.role,
          })
        );
        if (data.user.profile) {
          data.user.profile = signedUrltoNormalUrl(data.user.profile);
        }
        dispatch(getUserDetails({ user: data.user }));

        showToast(message, "success");

        const routes: Record<string, string> = {
          student: "/student",
          tutor: "/tutor/dashboard",
          admin: "/admin/dashboard",
        };

        router.push(routes[data.role]);
      } else {
        showToast("Failed to set role", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("An error occurred", "error");
    }
  };

  return (
    <div className="w-full h-screen bg-black flex justify-center items-center ">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-800 p-20 rounded-2xl"
      >
        <h2 className="text-white text-3xl ">Role Selection</h2>
        <div className="space-y-2">
          <label
            htmlFor="role"
            className="block text-sm font-medium text-zinc-200"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="" disabled>
              Select...
            </option>
            <option value="student">Student</option>
            <option value="tutor">Teacher</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default page;
