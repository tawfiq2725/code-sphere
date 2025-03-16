"use client";
import React, { useEffect, useState } from "react";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement, // Add this import
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import Link from "next/link";
import { dashboardData } from "@/api/admin";
import api from "@/api/axios";

import { showToast } from "@/utils/toastUtil";

// Register necessary ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement, // Register BarElement here
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// A reusable stat card component
interface StatCardProps {
  title: string;
  value: number | string;
}
const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center">
    <h3 className="text-gray-300 text-lg">{title}</h3>
    <p className="text-3xl font-bold text-white mt-2">{value}</p>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>({});

  // Fetch dashboard data
  useEffect(() => {
    dashboardData()
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        console.log("Failed to fetch dashboard data:", error);
      });
  }, []);

  const [revenueFilter, setRevenueFilter] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("daily");
  const [revenueData, setRevenueData] = useState<ChartData<"line"> | null>(
    null
  );
  const [topTutors, setTopTutors] = useState<ChartData<"bar"> | null>(null);
  const [enrollmentData, setEnrollmentData] =
    useState<ChartData<"doughnut"> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch revenue data
  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get("/api/reports/revenue", {
          params: { filter: revenueFilter },
        });
        if (data.success) {
          setRevenueData(data.data);
        } else {
          showToast("Failed to fetch revenue data", "error");
          setError("Failed to fetch revenue data");
        }
      } catch (err) {
        showToast("An error occurred while fetching data", "error");
        setError("An error occurred while fetching data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenueData();
  }, [revenueFilter]);

  const revenueOptions: ChartOptions<"line"> = {
    plugins: {
      legend: {
        labels: { color: "white" },
      },
      title: {
        display: true,
        text: `${
          revenueFilter.charAt(0).toUpperCase() + revenueFilter.slice(1)
        } Revenue`,
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

  // Fetch enrollment data
  useEffect(() => {
    const fetchEnrollmentData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get("/api/reports/enrollments");
        if (data.success) {
          setEnrollmentData(data.data);
        } else {
          setError("Failed to fetch enrollment data");
        }
      } catch (err) {
        setError("An error occurred while fetching data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollmentData();
  }, []);

  // Fetch top tutors data
  useEffect(() => {
    const fetchTopTutors = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/api/reports/get-toptutors");

        if (response.data.success) {
          const labels = response.data.data.map(
            (tutor: any) => tutor.tutorName
          );
          const data = response.data.data.map(
            (tutor: any) => tutor.totalEnrollments
          );
          setTopTutors({
            labels,
            datasets: [
              {
                label: "Enrollments",
                data,
                backgroundColor: "#4ade80",
              },
            ],
          });
        } else {
          setError("Failed to fetch top tutors");
        }
      } catch (err) {
        setError("An error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopTutors();
  }, []);

  // Sample statistics data
  const stats = {
    totalStudents: data.totalUsers ?? 0,
    totalCourses: data.totalCourses ?? 0,
    totalTutors: data.totalTutors ?? 0,
    totalRevenue: data.totalRevenue ?? 0,
    totalOrders: data.totalOrders ?? 0,
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <h1 className="text-4xl font-bold text-white mb-8 pl-10">
        Admin Dashboard
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Students" value={stats.totalStudents} />
        <StatCard title="Total Courses" value={stats.totalCourses} />
        <StatCard title="Total Tutors" value={stats.totalTutors} />
        <StatCard title="Total Revenue" value={stats.totalRevenue} />
        <StatCard title="Total Enrolled" value={stats.totalOrders} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart with Filter */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Revenue Chart</h2>
            <select
              value={revenueFilter}
              onChange={(e) =>
                setRevenueFilter(
                  e.target.value as "daily" | "weekly" | "monthly" | "yearly"
                )
              }
              className="bg-gray-700 text-white rounded p-1 outline-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="text-white">Loading...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : revenueData ? (
              <Line data={revenueData} options={revenueOptions} />
            ) : (
              <div className="text-white">No data available</div>
            )}
          </div>
        </div>

        {/* Course Enrollment Chart */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-white mb-4">
            Course Enrollments
          </h2>
          <div className="h-64">
            {loading ? (
              <div className="text-white">Loading...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : enrollmentData ? (
              <Doughnut data={enrollmentData} />
            ) : (
              <div className="text-white">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Tutors and Top Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Tutors */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-white mb-4">
            Top Tutors by Enrollments
          </h2>
          <div className="h-64">
            {loading ? (
              <div className="text-white">Loading...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : topTutors ? (
              <Bar data={topTutors} />
            ) : (
              <div className="text-white">No data available</div>
            )}
          </div>
        </div>
        {/* Reports */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-3xl font-bold text-white mb-4">
            Reports & Analytics
          </h2>
          <p className="text-gray-300 mb-8">
            Dive deep into your data with detailed order and membership
            analytics.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/order-reports"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-md transition-colors duration-300 text-center"
            >
              Order Reports
            </Link>
            <Link
              href="/admin/membership-reports"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-md transition-colors duration-300 text-center"
            >
              Membership Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
