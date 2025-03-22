"use client";
import React, { useEffect, useState } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import api from "@/api/axios";
import { showToast } from "@/utils/toastUtil";
import { useSelector } from "react-redux";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { createSocket } from "@/utils/config/socket";
import { Socket } from "socket.io-client";
import { NotificationPanel } from "@/app/components/common/Notification";
import { TodoList } from "@/app/components/common/Todo";
import { StatCard } from "@/app/components/common/StarCard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Student {
  _id: string;
  name: string;
  email: string;
  profile?: string;
  hasNewMessage?: boolean;
}

const TutorDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>({
    totalCourses: 0,
    totalEnrollments: 0,
    totalStudents: 0,
    totalRevenue: 0,
    avgProgress: 0,
    enrolledCount: 0,
    completedCount: 0,
    completionRate: 0,
    enrollmentTrend: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tutorId, setTutorId] = useState<string>("");
  const { user } = useSelector((state: any) => state.auth);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const id = user.user._id;
    setTutorId(id);
  }, [user.user._id]);

  useEffect(() => {
    if (!tutorId) return;

    const s = createSocket();
    setSocket(s);

    s.on("connect", () => {
      console.log("Socket connected in dashboard:", s.id);
      s.emit("register", { type: "tutor", id: tutorId });
    });
    s.on(
      "notification",
      (notification: {
        chatId: string;
        senderType: "student" | "tutor";
        senderId: string;
        message: string;
      }) => {
        if (notification.senderType === "student") {
          const student = students.find((s) => s._id === notification.senderId);

          if (student) {
            const newNotification = {
              id: Date.now().toString(),
              studentName: student.name,
              studentId: student._id,
              message: notification.message,
              timestamp: new Date(),
              studentProfile: student.profile,
              read: false,
            };

            setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
            setUnreadCount((prev) => prev + 1);
          }
        }
      }
    );

    return () => {
      s.disconnect();
    };
  }, [tutorId, students]);

  useEffect(() => {
    if (!tutorId) return;

    const fetchStudents = async () => {
      try {
        const { data } = await api.get(`/tutor/get-students/${tutorId}`);
        if (data && data.data) {
          setStudents(data.data);
        }
      } catch (error) {
        console.log("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [tutorId]);

  // Fetch dashboard data
  useEffect(() => {
    if (!tutorId) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/tutor/dashboard/tutor/${tutorId}`);
        if (data.success) {
          setDashboardData(data.data);
        } else {
          showToast("Failed to fetch dashboard data", "error");
          setError("Failed to fetch dashboard data");
        }
      } catch (err) {
        setError("An error occurred while fetching data");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [tutorId]);

  // Function to mark notification as read
  const markNotificationAsRead = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Convert the enrollmentTrend object to an array for chart consumption
  const enrollmentTrendArray = Object.keys(
    dashboardData.enrollmentTrend || {}
  ).map((key) => ({
    _id: key,
    count: dashboardData.enrollmentTrend[key],
  }));

  // Prepare enrollment trend data for chart
  const enrollmentTrendData: ChartData<"line"> = {
    labels: enrollmentTrendArray.map((item) => item._id),
    datasets: [
      {
        label: "Enrollments",
        data: enrollmentTrendArray.map((item) => item.count),
        borderColor: "#4ade80",
        backgroundColor: "rgba(74, 222, 128, 0.2)",
        tension: 0.4,
      },
    ],
  };

  // Chart options
  const chartOptions: ChartOptions<"line"> = {
    plugins: {
      legend: {
        labels: { color: "white" },
      },
      title: {
        display: true,
        text: "Enrollment Trend",
        color: "white",
      },
    },
    scales: {
      x: {
        ticks: { color: "white" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        ticks: { color: "white" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  // Course completion data
  const completionData: ChartData<"doughnut"> = {
    labels: ["Completed", "In Progress"],
    datasets: [
      {
        data: [
          dashboardData.completedCount || 0,
          (dashboardData.enrolledCount || 0) -
            (dashboardData.completedCount || 0),
        ],
        backgroundColor: ["#4ade80", "#3730a3"],
        borderColor: ["#22c55e", "#312e81"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="flex justify-between items-center mb-8 pl-10 pr-4">
        <h1 className="text-4xl font-bold text-white">Tutor Dashboard</h1>

        <Link href="/tutor/auth/message">
          <div className="flex items-center bg-purple-800 hover:bg-purple-700 px-4 py-2 rounded-lg text-white transition-colors cursor-pointer">
            <MessageSquare size={20} className="mr-2" />
            <span>Messages</span>
            {unreadCount > 0 && (
              <div className="ml-2 bg-purple-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </div>
            )}
          </div>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-white text-xl">Loading your dashboard...</div>
        </div>
      ) : error ? (
        <div className="bg-red-800 text-white p-4 rounded-lg mb-8">{error}</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard
              title="Total Courses"
              value={dashboardData.totalCourses}
            />
            <StatCard
              title="Total Students"
              value={dashboardData.totalStudents}
            />
            <StatCard
              title="Total Enrollments"
              value={dashboardData.totalEnrollments}
            />
            <StatCard
              title="Total Revenue"
              value={`₹${Math.round(
                dashboardData.totalRevenue
              ).toLocaleString()}`}
            />
            <StatCard
              title="Completion Rate"
              value={`${Math.round(dashboardData.completionRate)}%`}
            />
          </div>

          {/* Charts and Notifications Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Enrollment Trend Chart */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-white mb-4">
                High Enrollments
              </h2>
              <div className="h-64">
                {enrollmentTrendArray.length > 0 ? (
                  <Line data={enrollmentTrendData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No enrollment data available yet
                  </div>
                )}
              </div>
            </div>

            {/* Notifications Panel (replacing Todo) */}
            <NotificationPanel
              notifications={notifications}
              onMarkAsRead={markNotificationAsRead}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TodoList />

            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-white mb-4">
                Course Completion Status
              </h2>
              <div className="h-64">
                <Doughnut
                  data={completionData}
                  options={{
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: { color: "white" },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TutorDashboard;
