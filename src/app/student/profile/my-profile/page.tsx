"use client";
import { logout, getUserDetails } from "@/store/slice/authSlice";
import { backendUrl } from "@/utils/backendUrl";
import { showToast } from "@/utils/toastUtil";
import { useState, useRef, useEffect } from "react";
import Cookies from "js-cookie";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Eye, EyeConfirm } from "@/app/components/common/Eye";

export default function UserProfile() {
  const dispatch = useDispatch();
  const router = useRouter();
  const token = Cookies.get("jwt_token");

  const { user } = useSelector((state: any) => state.auth);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const email = localStorage.getItem("userEmail");
      const token = localStorage.getItem("jwt_token");
      const response = await fetch(`${backendUrl}/get-profile?email=${email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        dispatch(getUserDetails({ user: data.data }));
      } else {
        showToast(data.message, "error");
      }
    } catch (error: any) {
      console.log("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // State for image upload and password change
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

    try {
      const response = await fetch(
        `${backendUrl}/api/user/update-profile-image`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        showToast("Profile image updated successfully", "success");
        router.refresh();
        fetchUserProfile();
        setSelectedImage(null);
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      showToast("Error uploading image", "error");
    } finally {
      setLoading(false);
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
                  required
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
                  required
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
                  required
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
