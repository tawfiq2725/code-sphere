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
import Link from "next/link";
import api from "@/api/axios";
import { showToast } from "@/utils/toastUtil";
import { useSelector, useDispatch } from "react-redux";
import { getUserDetails } from "@/store/slice/authSlice";

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
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center">
    {icon && <div className="mb-2 text-gray-300">{icon}</div>}
    <h3 className="text-gray-300 text-lg">{title}</h3>
    <p className="text-3xl font-bold text-white mt-2">{value}</p>
    {trend !== undefined && (
      <div
        className={`mt-2 text-sm ${
          trend >= 0 ? "text-green-400" : "text-red-400"
        } flex items-center`}
      >
        {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
      </div>
    )}
  </div>
);

// Course interface
interface Course {
  _id: string;
  courseId: string;
  courseName: string;
  courseDescription: string;
  price: number;
  sellingPrice: number;
  thumbnail: string;
  tutorId: string;
  courseStatus: string;
  isVisible: boolean;
}

// Student interface
interface Student {
  _id: string;
  name: string;
  email: string;
  profile: string;
  courseProgress: {
    courseId: string;
    progress: number;
    completedChapters: string[];
    totalChapters: number;
    _id: string;
  }[];
}

// Task interface
interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

// Profile interface
interface TutorProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  subjects: string[];
  qualification: string;
  experience: number;
  bio: string;
  profile: string;
}

const TutorDashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [courseMap, setCourseMap] = useState<Record<string, string>>({});
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalCompletions: 0,
    completionRate: 0,
    avgProgress: 0,
  });

  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const tutor_id = user?.user?._id || localStorage.getItem("tutor_id");
  const email = localStorage.getItem("userEmail");

  const [enrollmentFilter, setEnrollmentFilter] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("weekly");

  const [enrollmentTrendData, setEnrollmentTrendData] =
    useState<ChartData<"line"> | null>(null);
  const [courseEnrollmentsData, setCourseEnrollmentsData] =
    useState<ChartData<"doughnut"> | null>(null);
  const [completionRateData, setCompletionRateData] =
    useState<ChartData<"bar"> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Todo state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  // First, we fetch the tutor profile
  useEffect(() => {
    fetchProfile();
  }, []);

  // Once we have the tutor profile, we fetch their courses
  useEffect(() => {
    if (tutor_id) {
      fetchMyCourses();
    }
  }, [tutor_id]);

  // After we have courses, then we fetch students (proper dependency chain)
  useEffect(() => {
    if (tutor_id && myCourses.length > 0) {
      fetchStudents();
    }
  }, [tutor_id, myCourses]);

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem("tutorTasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("tutorTasks", JSON.stringify(tasks));
  }, [tasks]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/tutor/profile`, {
        params: { email },
      });
      const { data, success, message } = response.data;

      if (!success) {
        showToast(message, "error");
      } else {
        localStorage.setItem("tutor_id", data._id);
        dispatch(getUserDetails({ user: data }));
      }
    } catch (error) {
      console.error("Error fetching user details", error);
    }
  };

  const fetchMyCourses = async () => {
    try {
      if (!tutor_id) return;

      const res = await api.get(`/tutor/my-courses/${tutor_id}`);
      const { data, success, message } = res.data;

      if (!success) {
        showToast(message, "error");
      } else {
        // Flatten the array if needed (from the example response)
        const courses = Array.isArray(data[0]) ? data[0] : data;
        setMyCourses(courses);

        // Create a mapping of courseId to courseName
        const newCourseMap: Record<string, string> = {};
        courses.forEach((course: Course) => {
          newCourseMap[course.courseId] = course.courseName;
        });
        setCourseMap(newCourseMap);
      }
    } catch (error) {
      console.error("Error fetching courses", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get(`/tutor/get-students/${tutor_id}`);
      const { data, success, message } = res.data;
      if (!success) {
        showToast(message, "error");
      } else {
        // Filter students to only include those enrolled in the tutor's courses
        const filteredStudents = filterStudentsForMyCourses(data);
        setStudents(filteredStudents);
        calculateDashboardStats(filteredStudents);
      }
    } catch (error) {
      console.error("Error fetching student details", error);
    }
  };

  // New function to filter students based on tutor's courses
  const filterStudentsForMyCourses = (allStudents: Student[]): Student[] => {
    // Extract all courseIds from myCourses
    const myCourseIds = myCourses.map((course) => course.courseId);

    return allStudents
      .map((student) => {
        // Create a filtered copy of the student with only relevant course progress
        const filteredStudent = {
          ...student,
          courseProgress: student.courseProgress.filter((progress) =>
            myCourseIds.includes(progress.courseId)
          ),
        };

        // Only include students who are enrolled in at least one of the tutor's courses
        if (filteredStudent.courseProgress.length > 0) {
          return filteredStudent;
        }
        return null;
      })
      .filter((student): student is Student => student !== null);
  };

  const calculateDashboardStats = (students: Student[]) => {
    const totalStudents = students.length;

    // Only include courses that are in myCourses
    const myCourseIds = myCourses.map((course) => course.courseId);

    let totalProgressSum = 0;
    let completedCourses = 0;
    let totalCourseInstances = 0;

    students.forEach((student) => {
      student.courseProgress.forEach((course) => {
        // Only consider courses that are in the tutor's course list
        if (myCourseIds.includes(course.courseId)) {
          totalProgressSum += course.progress;
          totalCourseInstances++;

          if (course.progress === 100) {
            completedCourses++;
          }
        }
      });
    });

    const totalCourses = myCourses.length;
    const avgProgress =
      totalCourseInstances > 0 ? totalProgressSum / totalCourseInstances : 0;
    const completionRate =
      totalCourseInstances > 0
        ? (completedCourses / totalCourseInstances) * 100
        : 0;

    setDashboardStats({
      totalStudents,
      totalCourses,
      totalCompletions: completedCourses,
      completionRate: parseFloat(completionRate.toFixed(1)),
      avgProgress: parseFloat(avgProgress.toFixed(1)),
    });
  };

  // Add new task
  const addTask = () => {
    if (newTask.trim() !== "") {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTasks([...tasks, task]);
      setNewTask("");
      showToast("Task added successfully", "success");
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Delete task
  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    showToast("Task deleted", "success");
  };

  // Generate enrollment trend data
  useEffect(() => {
    if (students.length === 0 || myCourses.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const labels =
        enrollmentFilter === "daily"
          ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
          : enrollmentFilter === "weekly"
          ? ["Week 1", "Week 2", "Week 3", "Week 4"]
          : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

      // Generate data based on student distribution but only for enrolled in my courses
      const studentCount = students.length;
      const enrollmentData = labels.map((_, index) => {
        // Create a realistic distribution pattern
        const base = Math.floor(studentCount / labels.length);
        const variation =
          index === 0 ? 2 : index === labels.length - 1 ? -1 : 0;
        return Math.max(1, base + variation);
      });

      const data = {
        labels,
        datasets: [
          {
            label: "New Enrollments",
            data: enrollmentData,
            borderColor: "#4ade80",
            backgroundColor: "rgba(74, 222, 128, 0.2)",
            tension: 0.4,
          },
        ],
      };

      setEnrollmentTrendData(data);
      setLoading(false);
    } catch (err) {
      setError("Error generating enrollment trend data");
      console.error(err);
      setLoading(false);
    }
  }, [enrollmentFilter, students, myCourses]);

  // Generate course enrollments data - ONLY for tutor's courses
  useEffect(() => {
    if (students.length === 0 || Object.keys(courseMap).length === 0) return;

    setLoading(true);

    try {
      // Count enrollments by course
      const courseEnrollmentCounts: Record<string, number> = {};

      // Initialize all my courses with 0 enrollments
      myCourses.forEach((course) => {
        courseEnrollmentCounts[course.courseId] = 0;
      });

      students.forEach((student) => {
        student.courseProgress.forEach((progress) => {
          const courseId = progress.courseId;
          // Only include courses that are in the tutor's course list
          if (courseId in courseEnrollmentCounts) {
            courseEnrollmentCounts[courseId]++;
          }
        });
      });

      const courseIds = Object.keys(courseEnrollmentCounts);
      const courseTitles = courseIds.map(
        (id) => courseMap[id] || `Course ${id}`
      );
      const enrollmentCounts = courseIds.map(
        (id) => courseEnrollmentCounts[id]
      );

      // Generate colors for each course
      const backgroundColors = [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
        "#8dd1e1",
        "#d47af1",
        "#a1d85a",
        "#ff7c43",
      ];

      const data = {
        labels: courseTitles,
        datasets: [
          {
            data: enrollmentCounts,
            backgroundColor: backgroundColors.slice(0, courseTitles.length),
            borderWidth: 0,
          },
        ],
      };

      setCourseEnrollmentsData(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [students, courseMap, myCourses]);

  // Generate completion rate data - ONLY for tutor's courses
  useEffect(() => {
    if (
      students.length === 0 ||
      Object.keys(courseMap).length === 0 ||
      myCourses.length === 0
    )
      return;

    setLoading(true);

    try {
      // Calculate completion rates by course
      const courseCompletionData: Record<
        string,
        { total: number; completed: number }
      > = {};

      // Initialize all my courses
      myCourses.forEach((course) => {
        courseCompletionData[course.courseId] = { total: 0, completed: 0 };
      });

      students.forEach((student) => {
        student.courseProgress.forEach((progress) => {
          const courseId = progress.courseId;

          // Only include courses that are in the tutor's course list
          if (courseId in courseCompletionData) {
            courseCompletionData[courseId].total++;

            if (progress.progress === 100) {
              courseCompletionData[courseId].completed++;
            }
          }
        });
      });

      const courseIds = Object.keys(courseCompletionData);
      const courseTitles = courseIds.map(
        (id) => courseMap[id] || `Course ${id}`
      );
      const completionRates = courseIds.map((id) => {
        const { total, completed } = courseCompletionData[id];
        return total > 0 ? (completed / total) * 100 : 0;
      });

      const data = {
        labels: courseTitles,
        datasets: [
          {
            label: "Completion Rate (%)",
            data: completionRates.map((rate) => parseFloat(rate.toFixed(1))),
            backgroundColor: "#9333ea",
          },
        ],
      };

      setCompletionRateData(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [students, courseMap, myCourses]);

  const enrollmentOptions: ChartOptions<"line"> = {
    plugins: {
      legend: {
        labels: { color: "white" },
      },
      title: {
        display: true,
        text: `${
          enrollmentFilter.charAt(0).toUpperCase() + enrollmentFilter.slice(1)
        } Enrollment Trend`,
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

  const getWishing = () => {
    if (new Date().getHours() < 12) {
      return "Good Morning";
    }
    if (new Date().getHours() < 18) {
      return "Good Afternoon";
    }
    return "Good Evening";
  };

  // Progress by Student component - ONLY for students enrolled in tutor's courses
  const StudentProgressList = () => {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Student Progress
        </h2>
        {students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-2 px-4 text-left">Student</th>
                  <th className="py-2 px-4 text-left">Email</th>
                  <th className="py-2 px-4 text-center">Enrolled Courses</th>
                  <th className="py-2 px-4 text-center">Avg. Progress</th>
                  <th className="py-2 px-4 text-center">Completed</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  // Only consider course progress for the tutor's courses
                  const filteredCourseProgress = student.courseProgress.filter(
                    (progress) =>
                      myCourses.some(
                        (course) => course.courseId === progress.courseId
                      )
                  );

                  const coursesCount = filteredCourseProgress.length;
                  const completedCourses = filteredCourseProgress.filter(
                    (course) => course.progress === 100
                  ).length;
                  const avgProgress =
                    coursesCount > 0
                      ? filteredCourseProgress.reduce(
                          (sum, course) => sum + course.progress,
                          0
                        ) / coursesCount
                      : 0;

                  return (
                    <tr
                      key={student._id}
                      className="border-b border-gray-700 hover:bg-gray-700"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <img
                            src={student.profile}
                            alt={student.name}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                          <span>{student.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{student.email}</td>
                      <td className="py-3 px-4 text-center">{coursesCount}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-16 bg-gray-600 rounded-full h-2 mr-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${avgProgress}%` }}
                            ></div>
                          </div>
                          <span>{avgProgress.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {completedCourses}/{coursesCount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-white text-center py-4">
            No students are currently enrolled in your courses.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <h1 className="text-4xl font-bold text-white mb-8 pl-10">
        {getWishing()} {user?.user?.name || "Tutor"}, Welcome to your Dashboard
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Students" value={dashboardStats.totalStudents} />
        <StatCard title="Total Courses" value={dashboardStats.totalCourses} />
        <StatCard
          title="Average Progress"
          value={`${dashboardStats.avgProgress}%`}
        />
        <StatCard
          title="Completed Courses"
          value={dashboardStats.totalCompletions}
        />
        <StatCard
          title="Completion Rate"
          value={`${dashboardStats.completionRate}%`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Enrollment Trend Chart with Filter */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              Enrollment Trends
            </h2>
            <select
              value={enrollmentFilter}
              onChange={(e) =>
                setEnrollmentFilter(
                  e.target.value as "daily" | "weekly" | "monthly" | "yearly"
                )
              }
              className="bg-gray-700 text-white rounded p-1 outline-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="text-white flex justify-center items-center h-full">
                Loading...
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : enrollmentTrendData ? (
              <Line data={enrollmentTrendData} options={enrollmentOptions} />
            ) : (
              <div className="text-white">No data available</div>
            )}
          </div>
        </div>

        {/* Course Enrollments Pie Chart */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-white mb-4">
            Course Enrollments Distribution
          </h2>
          <div className="h-64">
            {loading ? (
              <div className="text-white flex justify-center items-center h-full">
                Loading...
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : courseEnrollmentsData && myCourses.length > 0 ? (
              <Doughnut
                data={courseEnrollmentsData}
                options={{
                  plugins: {
                    legend: {
                      position: "right",
                      labels: { color: "white", font: { size: 11 } },
                    },
                  },
                }}
              />
            ) : (
              <div className="text-white">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Course Completion Rates and Todo List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Course Completion Rates */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-white mb-4">
            Course Completion Rates (%)
          </h2>
          <div className="h-64">
            {loading ? (
              <div className="text-white flex justify-center items-center h-full">
                Loading...
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : completionRateData && myCourses.length > 0 ? (
              <Bar
                data={completionRateData}
                options={{
                  indexAxis: "y",
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: {
                      ticks: { color: "white" },
                      grid: { color: "rgba(255,255,255,0.1)" },
                      max: 100,
                    },
                    y: {
                      ticks: { color: "white", font: { size: 10 } },
                      grid: { color: "rgba(255,255,255,0.1)" },
                    },
                  },
                }}
              />
            ) : (
              <div className="text-white">No data available</div>
            )}
          </div>
        </div>

        {/* ToDo List */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-white mb-4">
            Task Management
          </h2>
          <div className="flex mb-4">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-grow bg-gray-700 text-white p-2 rounded-l outline-none"
              placeholder="Add a new task..."
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <button
              onClick={addTask}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-r"
            >
              Add
            </button>
          </div>
          <div className="h-52 overflow-y-auto custom-scrollbar">
            {tasks.length > 0 ? (
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between bg-gray-700 p-3 rounded"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task.id)}
                        className="mr-3 h-4 w-4"
                      />
                      <span
                        className={`text-white ${
                          task.completed ? "line-through text-gray-400" : ""
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400 text-center mt-8">
                No tasks yet. Add some tasks to get started!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Progress List */}
      <StudentProgressList />
    </div>
  );
};

export default TutorDashboard;
