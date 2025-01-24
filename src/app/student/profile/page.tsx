"use client";
import { logout } from "@/store/slice/authSlice";
import { showToast } from "@/utils/toastUtil";
import React from "react";
import { useDispatch } from "react-redux";

const page = () => {
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logout());
    showToast("Logged out successfully", "success");
  };
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <button
        className="bg-red-500 text-white py-1 px-4 rounded-lg hover:bg-red-600"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default page;
