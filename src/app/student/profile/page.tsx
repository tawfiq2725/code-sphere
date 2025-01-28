// "use client";
// import { logout } from "@/store/slice/authSlice";
// import { showToast } from "@/utils/toastUtil";
// import React from "react";
// import { useDispatch } from "react-redux";

// const page = () => {
//   const dispatch = useDispatch();
//   const handleLogout = () => {
//     dispatch(logout());
//     showToast("Logged out successfully", "success");
//   };
//   return (
//     <div className="w-full h-screen flex items-center justify-center">
//       <button
//         className="bg-red-500 text-white py-1 px-4 rounded-lg hover:bg-red-600"
//         onClick={handleLogout}
//       >
//         Logout
//       </button>
//     </div>
//   );
// };

// export default page;

"use client";

import { logout } from "@/store/slice/authSlice";
import { backendUrl } from "@/utils/backendUrl";
import { showToast } from "@/utils/toastUtil";
import { useState } from "react";
import Cookies from "js-cookie";
import { useSelector, useDispatch } from "react-redux";

export default function UserProfile() {
  interface User {
    user: any;
    name: string;
    email: string;
    verified: boolean;
  }
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dispatch = useDispatch();
  const token = Cookies.get("jwt_token");
  const { user } = useSelector((state: { auth: { user: User } }) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    const response = fetch(`${backendUrl}/api/user/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
        userId: user.user._id,
      }),
    });
    const data = await (await response).json();
    if (data.success) {
      showToast("Password changed successfully", "success");
    } else {
      showToast(data.message, "error");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    showToast("Logged out successfully", "success");
  };
  console.log(user.user.isBlocked);
  return (
    <div className="w-full bg-black  px-4 py-8 max-w-full flex justify-center items-center flex-col">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>

      {/* Personal Information Section */}
      <div className="bg-gray-800  shadow-md rounded-lg p-6  mb-8 w-2/3">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Personal Information
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">{user.user.name}</h3>
            <p className=" text-white">{user.user.email}</p>
          </div>
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-2 sm:mt-0">
            Verified
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 p-2 text-white mt-4 rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Change Password Section */}
      <div className="bg-gray-800 shadow-md w-2/3 rounded-lg p-6">
        <h2 className="text-xl text-white font-semibold mb-4">
          Change Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="old-password"
              className="block text-sm font-medium text-white mb-1"
            >
              Old Password
            </label>
            <input
              id="old-password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your old password"
              required
            />
          </div>
          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-white mb-1"
            >
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your new password"
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-white mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Confirm your new password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
