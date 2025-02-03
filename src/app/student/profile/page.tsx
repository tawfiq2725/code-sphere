"use client";

import { logout, updateUserProfile } from "@/store/slice/authSlice";
import { backendUrl } from "@/utils/backendUrl";
import { showToast } from "@/utils/toastUtil";
import { useState, useRef } from "react";
import Cookies from "js-cookie";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";

export default function UserProfile() {
  interface User {
    user: any;
    name: string;
    email: string;
    verified: boolean;
    image: string;
  }
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const dispatch = useDispatch();
  const token = Cookies.get("jwt_token");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useSelector((state: { auth: { user: User } }) => state.auth);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("userId", user.user._id);

    try {
      const response = await fetch(
        `${backendUrl}/api/user/update-profile-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        showToast("Profile image updated successfully", "success");
        dispatch(updateUserProfile({ image: data.imageUrl }));
        setSelectedImage(null);
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      showToast("Error uploading image", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    const response = await fetch(`${backendUrl}/api/user/change-password`, {
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

    const data = await response.json();
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

  return (
    <div className="w-full bg-black px-4 py-8 flex justify-center items-center flex-col">
      <h1 className="text-3xl font-bold mb-8 text-white">User Profile</h1>

      {/* Personal Information Section */}
      <div className="bg-gray-800 shadow-md rounded-lg p-6 mb-8 w-2/3">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Personal Information
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">{user.user.name}</h3>
            <p className="text-white">{user.user.email}</p>
          </div>
          <div className="relative">
            <span className="mb-5 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Verified
            </span>
            <div
              className="rounded-full overflow-hidden w-24 h-24 border-2 border-gray-300 cursor-pointer mt-2"
              onClick={handleImageClick}
            >
              <Image
                src={
                  selectedImage
                    ? URL.createObjectURL(selectedImage)
                    : user.user.image ?? "/default-profile.jpg"
                }
                width={96}
                height={96}
                alt="Profile Picture"
                className="object-cover w-full h-full"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>
        {selectedImage && (
          <button
            onClick={handleImageUpload}
            className="bg-blue-500 text-white px-4 py-2 mt-3 rounded-md hover:bg-blue-700"
          >
            Update Image
          </button>
        )}
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
              className="w-full px-3 py-2 border border-gray-500 rounded-md bg-gray-700 text-white"
              placeholder="Enter your old password"
              required
              autoComplete="off"
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
              className="w-full px-3 py-2 border border-gray-500 rounded-md bg-gray-700 text-white"
              placeholder="Enter your new password"
              required
              autoComplete="off"
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
              className="w-full px-3 py-2 border border-gray-500 rounded-md bg-gray-700 text-white"
              placeholder="Confirm your new password"
              required
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-700"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
