"use client";
import { backendUrl } from "@/utils/backendUrl";
import { showToast } from "@/utils/toastUtil";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { getUserDetails } from "@/store/slice/authSlice";
import { useEffect, useState } from "react";
export default function Page() {
  useEffect(() => {
    fetchProfile();
  }, []);
  const { user } = useSelector((state: any) => state.auth);

  const dispatch = useDispatch();
  const email = localStorage.getItem("userEmail");
  const token = Cookies.get("jwt_token");

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `${backendUrl}/tutor/profile?email=${email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      localStorage.setItem("tutor_id", data.data._id);
      if (!data.success) {
        showToast(data.message, "error");
      } else {
        dispatch(getUserDetails({ user: data.data }));
      }
    } catch (error) {
      console.error("Error fetching user details", error);
    }
  };
  // Dummy data for demonstration
  const [totalStudents] = useState(5234);
  const [totalCourses] = useState(127);
  const [totalTutors] = useState(89);
  const [totalRevenue] = useState(523400);

  const revenueData = [4000, 3000, 5000, 4500, 6000, 5500];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  const courseEnrollmentData = [
    { name: "Web Dev", total: 340 },
    { name: "Data Science", total: 230 },
    { name: "Mobile App", total: 280 },
    { name: "UI/UX", total: 190 },
    { name: "AI/ML", total: 320 },
  ];

  const topSellingCourses = [
    { name: "Advanced JavaScript", sales: 1234, revenue: 61700 },
    { name: "Python for Data Science", sales: 987, revenue: 49350 },
    { name: "React Native Masterclass", sales: 876, revenue: 43800 },
    { name: "UI/UX Design Principles", sales: 765, revenue: 38250 },
  ];

  const topPerformers = [
    { name: "John Doe", courses: 12, students: 1234, rating: 4.9 },
    { name: "Jane Smith", courses: 10, students: 987, rating: 4.8 },
    { name: "Bob Johnson", courses: 8, students: 876, rating: 4.7 },
    { name: "Alice Brown", courses: 7, students: 765, rating: 4.6 },
  ];

  const maxRevenue = Math.max(...revenueData);
  const maxEnrollment = Math.max(
    ...courseEnrollmentData.map((item) => item.total)
  );
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            {
              title: "Total Students",
              value: totalStudents,
              color: "bg-blue-500",
            },
            {
              title: "Total Courses",
              value: totalCourses,
              color: "bg-green-500",
            },
            {
              title: "Total Tutors",
              value: totalTutors,
              color: "bg-yellow-500",
            },
            {
              title: "Total Revenue",
              value: `$${totalRevenue.toLocaleString()}`,
              color: "bg-purple-500",
            },
          ].map((item, index) => (
            <div
              key={index}
              className={`${item.color} rounded-lg shadow-lg p-5 text-white`}
            >
              <h2 className="text-lg font-semibold mb-2">{item.title}</h2>
              <p className="text-3xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Revenue Over Time</h2>
            <div className="relative h-64">
              {/* Y-axis */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-sm text-gray-600">
                {[0, 2000, 4000, 6000].map((value) => (
                  <span key={value}>${value}</span>
                ))}
              </div>
              {/* Chart area */}
              <div className="absolute left-12 right-0 top-0 bottom-0 flex items-end">
                {revenueData.map((value, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full bg-blue-500"
                      style={{ height: `${(value / maxRevenue) * 100}%` }}
                    ></div>
                    <span className="text-sm mt-2">{months[index]}</span>
                  </div>
                ))}
              </div>
              {/* Grid lines */}
              <div className="absolute left-12 right-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3].map((_, index) => (
                  <div
                    key={index}
                    className="border-t border-gray-200 w-full"
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Course Enrollment Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Course Enrollments</h2>
            <div className="relative h-64">
              {/* Y-axis */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-sm text-gray-600">
                {[0, 100, 200, 300, 400].map((value) => (
                  <span key={value}>{value}</span>
                ))}
              </div>
              {/* Chart area */}
              <div className="absolute left-12 right-0 top-0 bottom-0 flex items-end">
                {courseEnrollmentData.map((course, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full bg-green-500"
                      style={{
                        height: `${(course.total / maxEnrollment) * 100}%`,
                      }}
                    ></div>
                    <span className="text-sm mt-2 text-center">
                      {course.name}
                    </span>
                  </div>
                ))}
              </div>
              {/* Grid lines */}
              <div className="absolute left-12 right-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3, 4].map((_, index) => (
                  <div
                    key={index}
                    className="border-t border-gray-200 w-full"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Courses */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Top Selling Courses</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3">Course Name</th>
                  <th className="p-3">Sales</th>
                  <th className="p-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topSellingCourses.map((course, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3">{course.name}</td>
                    <td className="p-3">{course.sales}</td>
                    <td className="p-3">${course.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Top Performers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topPerformers.map((performer, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 shadow">
                <div className="w-16 h-16 bg-gray-300 rounded-full mb-3 mx-auto flex items-center justify-center text-xl font-semibold">
                  {performer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">
                  {performer.name}
                </h3>
                <p className="text-sm text-center text-gray-600">
                  {performer.courses} courses
                </p>
                <p className="text-sm text-center text-gray-600">
                  {performer.students} students
                </p>
                <p className="text-sm text-center text-gray-600">
                  {performer.rating} rating
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
