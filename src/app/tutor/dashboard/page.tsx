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
  useEffect(() => {
    const id = user.user._id;
    setTutorId(id);
  }, [user.user._id]);

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
        showToast("An error occurred while fetching data", "error");
        setError("An error occurred while fetching data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [tutorId]);

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
      <h1 className="text-4xl font-bold text-white mb-8 pl-10">
        Tutor Dashboard
      </h1>

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
              value={`${dashboardData.completionRate}%`}
            />
          </div>

          {/* Charts and Todo Section */}
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

            {/* Todo List Component */}
            <TodoList />
          </div>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

            {/* Revenue vs Enrollment Chart - replaced Quick Actions */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-white mb-4">
                Revenue & Engagement Metrics
              </h2>
              <div className="h-64">
                <Bar data={revenueEnrollmentData} options={barChartOptions} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TutorDashboard;
