"use client";
import { logout, getUserDetails } from "@/store/slice/authSlice";
import { showToast } from "@/utils/toastUtil";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { Eye, EyeConfirm } from "@/app/components/common/Eye";
import api from "@/api/axios";

export default function UserProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const email = user.user.email;
  console.log(email);
  const fetchUserProfile = async () => {
    try {
      const res = await api.get("/get-profile", {
        params: {
          email,
        },
      });
      console.log(res.data);
      const { message, success, data } = await res.data;

      if (success) {
        dispatch(getUserDetails({ user: data }));
      } else {
        showToast(message, "error");
      }
    } catch (error: any) {
      console.log("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Image input ref and handlers
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    setLoading(true);

    const formData = new FormData();
    formData.append("profileImage", selectedImage);
    formData.append("userId", user.user._id);
    console.log(formData);

    try {
      const response = await api.patch(
        "/api/user/update-profile-image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const { success, message, data } = response.data;
      if (success) {
        showToast(message, "success");
        dispatch(getUserDetails({ user: data }));
        setSelectedImage(null);
      } else {
        showToast(message, "error");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error uploading image";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast("Please fill in all fields", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    try {
      const response = await api.post("/api/user/change-password", {
        oldPassword,
        newPassword,
        userId: user.user._id,
      });

      const { success, message } = response.data;
      if (success) {
        showToast(message, "success");
      } else {
        showToast(message, "error");
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Error changing password";
      console.log(errorMsg);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    showToast("Logged out successfully", "success");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl font-extrabold text-white mb-10">User Profile</h1>

      {/* Profile Information Card */}
      <div className="w-full max-w-4xl space-y-8">
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">
                {user.user.name}
              </h2>
              <p className="mt-2 text-lg text-gray-300">{user.user.email}</p>
              <span className="mt-3 inline-block bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Verified
              </span>
            </div>
            <div className="mt-6 md:mt-0 relative">
              <div
                className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-600 cursor-pointer transform hover:scale-105 transition duration-200"
                onClick={handleImageClick}
              >
                <Image
                  src={
                    selectedImage
                      ? URL.createObjectURL(selectedImage)
                      : user.user.profile ?? "/default-profile.jpg"
                  }
                  width={112}
                  height={112}
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
            <div className="mt-4 flex space-x-4">
              <button
                onClick={handleImageUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin w-5 h-5 border-t-2 border-white rounded-full mr-2"></div>
                ) : null}
                Update Image
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Change Password Card */}
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Change Password
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="old-password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Old Password
              </label>
              <div className="relative">
                <input
                  id="old-password"
                  type={showPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your old password"
                  autoComplete="off"
                />
                <Eye
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your new password"
                  autoComplete="off"
                />
                <Eye
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm your new password"
                  autoComplete="off"
                />
                <EyeConfirm
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
