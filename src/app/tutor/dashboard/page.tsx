"use client";
import React, { useEffect, useState } from "react";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
import { MessageSquare, Bell } from "lucide-react";
import Link from "next/link";
import { createSocket } from "@/utils/config/socket";
import { Socket } from "socket.io-client";
import Image from "next/image";
import { signedUrltoNormalUrl } from "@/utils/presignedUrl";

// Register necessary ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// A reusable stat card component
interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center">
    {icon && <div className="mb-2 text-green-400">{icon}</div>}
    <h3 className="text-gray-300 text-lg">{title}</h3>
    <p className="text-3xl font-bold text-white mt-2">{value}</p>
  </div>
);

// Todo Component
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// Notification component for dashboard
interface Notification {
  id: string;
  studentName: string;
  studentId: string;
  message: string;
  timestamp: Date;
  studentProfile?: string;
  read: boolean;
}

const NotificationPanel: React.FC<{
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}> = ({ notifications, onMarkAsRead }) => {
  for (let user of notifications) {
    if (user.studentProfile) {
      let url = signedUrltoNormalUrl(user.studentProfile);
      user.studentProfile = url;
    }
  }
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Recent Messages</h2>
        <Link href="/tutor/auth/message">
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
                      src={
                        notification.studentProfile || "/default-profile.jpg"
                      }
                      alt={notification.studentName}
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
                        {notification.studentName}
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

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    // Get todos from localStorage if available
    const savedTodos = localStorage.getItem("tutorTodos");
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    // Save todos to localStorage when they change
    localStorage.setItem("tutorTodos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: inputValue,
        completed: false,
      };
      setTodos([...todos, newTodo]);
      setInputValue("");
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full">
      <h2 className="text-xl font-semibold text-white mb-4">Task List</h2>
      <div className="flex mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-l outline-none"
          placeholder="Add a new task..."
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
        />
        <button
          onClick={addTodo}
          className="bg-green-600 text-white px-4 py-2 rounded-r hover:bg-green-700 transition-colors"
        >
          Add
        </button>
      </div>
      <div className="overflow-y-auto max-h-64">
        {todos.length === 0 ? (
          <p className="text-gray-400 text-center py-4">
            No tasks yet. Add one above!
          </p>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between bg-gray-700 px-3 py-2 rounded"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="mr-3 h-4 w-4"
                  />
                  <span
                    className={`text-white ${
                      todo.completed ? "line-through text-gray-400" : ""
                    }`}
                  >
                    {todo.text}
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

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
    enrollmentTrend: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tutorId, setTutorId] = useState<string>("");
  const { user } = useSelector((state: any) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const id = user.user._id;
    setTutorId(id);
  }, [user.user._id]);

  // Setup socket connection
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
          // Find student in the list
          const student = students.find((s) => s._id === notification.senderId);

          if (student) {
            const newNotification: Notification = {
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
  }, [tutorId, students]);

  // Fetch students data
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

  // Prepare enrollment trend data for chart
  const enrollmentTrendData: ChartData<"line"> = {
    labels: dashboardData.enrollmentTrend?.map((item: any) => item._id) || [],
    datasets: [
      {
        label: "Enrollments",
        data:
          dashboardData.enrollmentTrend?.map((item: any) => item.count) || [],
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
          dashboardData.enrolledCount - (dashboardData.completedCount || 0),
        ],
        backgroundColor: ["#4ade80", "#3730a3"],
        borderColor: ["#22c55e", "#312e81"],
        borderWidth: 1,
      },
    ],
  };

  // Revenue vs Enrollment bar chart
  const revenueEnrollmentData: ChartData<"bar"> = {
    labels: ["Revenue (₹)", "Enrollments", "Students"],
    datasets: [
      {
        label: "Current Numbers",
        data: [
          dashboardData.totalRevenue || 0,
          dashboardData.totalEnrollments || 0,
          dashboardData.totalStudents || 0,
        ],
        backgroundColor: ["#4ade80", "#3730a3", "#f59e0b"],
      },
    ],
  };

  // Bar chart options
  const barChartOptions: ChartOptions<"bar"> = {
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Revenue and Engagement Metrics",
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
        beginAtZero: true,
      },
    },
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
                Enrollment Trend
              </h2>
              <div className="h-64">
                {dashboardData.enrollmentTrend?.length > 0 ? (
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

          {/* Todo and Chart Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Todo List Component (moved from above) */}
            <TodoList />

            {/* Course Completion Status */}
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
