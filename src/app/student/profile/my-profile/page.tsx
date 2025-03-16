"use client";
import { logout, getUserDetails } from "@/store/slice/authSlice";
import { showToast } from "@/utils/toastUtil";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { Eye, EyeConfirm } from "@/app/components/common/Eye";
import api from "@/api/axios";
import { signedUrltoNormalUrl } from "@/utils/presignedUrl";
import Link from "next/link";
import { Socket } from "socket.io-client";
import { Bell, MessageSquare } from "lucide-react";
import { createSocket } from "@/utils/config/socket";

// Notification component for dashboard
interface Notification {
  id: string;
  tutorName: string;
  tutorId: string;
  message: string;
  timestamp: Date;
  tutorProfile?: string;
  read: boolean;
}

const NotificationPanel: React.FC<{
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}> = ({ notifications, onMarkAsRead }) => {
  for (let user of notifications) {
    if (user.tutorProfile) {
      let url = signedUrltoNormalUrl(user.tutorProfile);
      user.tutorProfile = url;
    }
  }
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Recent Messages</h2>
        <Link href="/student/profile/message">
          <div className="text-green-400 hover:text-green-300 transition-colors flex items-center">
            <MessageSquare size={16} className="mr-1" />
            <span>Open Chat</span>
          </div>
        </Link>
      </div>

      <div className="overflow-y-auto max-h-64 custom-scrollbar">
        {notifications.length === 0 ? (
          <p className="text-gray-400 text-center py-4">
            No new messages. All caught up!
          </p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`flex items-center bg-gray-700 p-3 rounded transition-colors ${
                  !notification.read ? "border-l-4 border-l-purple-600" : ""
                }`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="relative">
                    <Image
                      src={notification.tutorProfile || "/default-profile.jpg"}
                      alt={notification.tutorName}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
                      priority
                    />
                    {!notification.read && (
                      <div className="absolute -top-1 -right-1 bg-purple-600 rounded-full p-0.5">
                        <Bell size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-white">
                        {notification.tutorName}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {new Date(notification.timestamp).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 truncate mt-1">
                      {notification.message}
                    </p>
                  </div>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => onMarkAsRead(notification.id)}
                    className="text-purple-400 hover:text-purple-300 ml-2 text-sm"
                  >
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

interface Tutor {
  _id: string;
  name: string;
  email: string;
  profile?: string;
  hasNewMessage?: boolean;
}

export default function UserProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [students, setStudents] = useState<Tutor[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [studentId, setStudentId] = useState<string>("");
  useEffect(() => {
    const id = user.user._id;
    setStudentId(id);
  }, [user.user._id]);

  // Setup socket connection
  useEffect(() => {
    if (!studentId) return;

    const s = createSocket();
    setSocket(s);

    s.on("connect", () => {
      console.log("Socket connected in dashboard:", s.id);
      s.emit("register", { type: "student", id: studentId });
    });
    s.on(
      "notification",
      (notification: {
        chatId: string;
        senderType: "student" | "tutor";
        senderId: string;
        message: string;
      }) => {
        if (notification.senderType === "tutor") {
          const student = students.find((s) => s._id === notification.senderId);

          if (student) {
            const newNotification: Notification = {
              id: Date.now().toString(),
              tutorName: student.name,
              tutorId: student._id,
              message: notification.message,
              timestamp: new Date(),
              tutorProfile: student.profile,
              read: false,
            };

            setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
            setUnreadCount((prev) => prev + 1);
            showToast(
              `New message from ${student.name}: ${notification.message}`,
              "info"
            );
          }
        }
      }
    );

    return () => {
      s.disconnect();
    };
  }, [studentId, students]);

  useEffect(() => {
    if (!studentId) return;

    const fetchStudents = async () => {
      try {
        const { data } = await api.get(`/student/tutor/${studentId}`);
        if (data && data.data) {
          setStudents(data.data);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [studentId]);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const userProfile = user.user;

  const email = userProfile.email;

  const fetchUserProfile = async () => {
    try {
      const res = await api.get("/get-profile", {
        params: { email },
      });

      const { message, success, data } = res.data;

      if (success) {
        let profile = signedUrltoNormalUrl(data.profile);
        data.profile = profile;
        dispatch(getUserDetails({ user: data }));
      } else {
        showToast(message, "error");
      }
    } catch (error) {
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
  const [activeTab, setActiveTab] = useState("profile");

  // Image input ref and handlers
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("profileImage", selectedImage);
    formData.append("userId", userProfile._id);

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
        let profile = signedUrltoNormalUrl(data.profile);
        data.profile = profile;
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
        userId: userProfile._id,
      });

      const { success, message } = response.data;
      if (success) {
        showToast(message, "success");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showToast(message, "error");
      }
    } catch (error: any) {
      console.log(error.response?.data?.message || "Error changing password");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    showToast("Logged out successfully", "success");
  };

  // Calculate course progress stats
  const courseProgress = userProfile.courseProgress || [];
  const completedCourses = courseProgress.filter(
    (course: any) => course.progress === 100
  ).length;
  const totalCourses = courseProgress.length;
  interface CourseProgress {
    _id: string;
    courseId: string;
    progress: number;
    completedChapters: string[];
    totalChapters: number;
  }

  interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    isBlocked: boolean;
    isTutor?: boolean;
    tutorStatus?: string;
    profile?: string;
    courseProgress?: CourseProgress[];
  }

  // The typed calculation:
  const averageProgress: number =
    totalCourses > 0
      ? courseProgress.reduce(
          (total: number, course: CourseProgress) => total + course.progress,
          0
        ) / totalCourses
      : 0;

  let googleId = user.user.googleId ? true : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center py-12 px-4">
      {/* Header with profile image and name */}
      <div className="w-full max-w-6xl mb-8">
        <div className="relative">
          {/* Banner */}
          <div className="h-48 w-full bg-gradient-to-r from-purple-900 via-purple-700 to-indigo-800 rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-black opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/70 to-transparent"></div>
          </div>

          {/* Profile Image */}
          <div className="absolute -bottom-16 left-8 md:left-12">
            <div
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-black cursor-pointer transform hover:scale-105 transition duration-200 ring-4 ring-purple-500 shadow-lg"
              onClick={handleImageClick}
            >
              <Image
                src={
                  selectedImage
                    ? URL.createObjectURL(selectedImage)
                    : userProfile.profile ?? "/default-profile.jpg"
                }
                width={128}
                height={128}
                alt="Profile Picture"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-sm font-medium">Change</span>
              </div>
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
      </div>

      {/* Main content area with tabs */}
      <div className="w-full max-w-6xl pt-16 space-y-8">
        {/* User info header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Left side - User info */}
          <div>
            <h1 className="text-4xl font-bold text-white">
              {userProfile.name}
            </h1>
            <p className="mt-2 text-lg text-gray-300">{userProfile.email}</p>

            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span className="inline-flex items-center bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                {userProfile.isVerified ? "Verified" : "Unverified"}
              </span>
              <span className="inline-flex items-center bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                {userProfile.role}
              </span>
              {userProfile.isTutor && (
                <span className="inline-flex items-center bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Tutor
                </span>
              )}
              <Link href="/student/profile/message">
                <span className="inline-flex items-center bg-purple-800 hover:bg-purple-700 px-3 py-1 rounded-full text-white text-xs font-semibold transition-colors cursor-pointer">
                  <MessageSquare size={14} className="mr-1" />
                  Messages
                  {unreadCount > 0 && (
                    <div className="ml-1 bg-purple-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount}
                    </div>
                  )}
                </span>
              </Link>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex space-x-3 self-start md:self-center">
            {selectedImage && (
              <button
                onClick={handleImageUpload}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin w-5 h-5 border-t-2 border-white rounded-full mr-2"></div>
                ) : null}
                Update Image
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-lg border border-gray-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === "profile"
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === "security"
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === "courses"
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Courses
            </button>
            <button
              onClick={() => setActiveTab("message")}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === "message"
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              New Messages
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* User Details Card */}
              <div className="md:col-span-2 bg-gray-800 bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl p-8">
                <h2 className="text-2xl font-semibold text-white mb-6 border-b border-gray-700 pb-3">
                  Profile Overview
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-gray-400 text-sm mb-1">Full Name</h3>
                      <p className="text-white font-medium">
                        {userProfile.name}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-gray-400 text-sm mb-1">Email</h3>
                      <p className="text-white font-medium">
                        {userProfile.email}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-gray-400 text-sm mb-1">Role</h3>
                      <p className="text-white font-medium capitalize">
                        {userProfile.role}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-gray-400 text-sm mb-1">Status</h3>
                      <p className="text-white font-medium">
                        {userProfile.isBlocked ? "Blocked" : "Active"}
                      </p>
                    </div>
                  </div>
                  {userProfile.isTutor && (
                    <div>
                      <h3 className="text-gray-400 text-sm mb-1">
                        Tutor Status
                      </h3>
                      <p className="text-white font-medium capitalize">
                        {userProfile.tutorStatus}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl p-8">
                <h2 className="text-2xl font-semibold text-white mb-6 border-b border-gray-700 pb-3">
                  Learning Stats
                </h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-gray-400 text-sm">
                        Courses Enrolled
                      </h3>
                      <span className="text-white font-medium">
                        {totalCourses}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full"
                        style={{ width: "100%" }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-gray-400 text-sm">
                        Courses Completed
                      </h3>
                      <span className="text-white font-medium">
                        {completedCourses}/{totalCourses}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            totalCourses
                              ? (completedCourses / totalCourses) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-gray-400 text-sm">
                        Average Progress
                      </h3>
                      <span className="text-white font-medium">
                        {averageProgress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full"
                        style={{ width: `${averageProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div>
              {!googleId && (
                <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl p-8">
                  <h2 className="text-2xl font-semibold text-white mb-6 border-b border-gray-700 pb-3">
                    Change Password
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
                    <div>
                      <label
                        htmlFor="old-password"
                        className="block text-sm font-medium text-gray-300 mb-1"
                      >
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          id="old-password"
                          type={showPassword ? "text" : "password"}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter your current password"
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
                          className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                          className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-lg"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              )}
              {googleId === true && (
                <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl p-8">
                  <h2 className="text-2xl font-semibold text-white mb-6">
                    Google Account
                  </h2>
                  <p className="text-gray-300">
                    You are signed in with Google. Password management is
                    handled through your Google account.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-6 border-b border-gray-700 pb-3">
                My Courses
              </h2>
              {courseProgress.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courseProgress.map((course: any) => (
                    <div
                      key={course._id}
                      className="bg-gray-700 rounded-xl p-5 hover:bg-gray-650 transition"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">
                          Course ID: {course.courseId}
                        </h3>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-600 text-white">
                          {course.progress}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                          className={`${
                            course.progress === 100
                              ? "bg-green-500"
                              : "bg-purple-500"
                          } h-2 rounded-full`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <div className="mt-4 text-sm text-gray-300">
                        <p>
                          {course.completedChapters.length} of{" "}
                          {course.totalChapters} chapters completed
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">
                    You are not enrolled in any courses yet.
                  </p>
                </div>
              )}
            </div>
          )}
          {activeTab === "message" && (
            <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-6 border-b border-gray-700 pb-3">
                Recent Messages
              </h2>
              <NotificationPanel
                notifications={notifications}
                onMarkAsRead={markNotificationAsRead}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
