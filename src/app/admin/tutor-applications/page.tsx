"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { showToast } from "@/utils/toastUtil";
import Link from "next/link";
import Pagination from "@/app/components/common/pagination";
import Search from "@/app/components/common/search";
import api from "@/api/axios";
import { User, FileCheck, Info, CheckCircle, XCircle } from "lucide-react";
import { IPagination } from "@/interface/pagination";
import { signedUrltoNormalUrl } from "@/utils/presignedUrl";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const TutorList = () => {
  interface User {
    _id: string;
    name: string;
    email: string;
    isVerified: boolean;
    isBlocked: boolean;
    isTutor: boolean;
    tutorStatus: string;
    qualification: string;
    experience: string;
    subjects: string[];
    certfications: string[];
    profile: string;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<IPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "rejected">(
    "all"
  );
  const usersPerPage = 5;
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch all tutor applications without filtering by tutorStatus
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: usersPerPage.toString(),
          search: debouncedSearchTerm,
        });

        const response = await api.get(`/admin/get-tutors/applications`, {
          params,
        });

        const { success, message, data } = await response.data;

        if (!success) {
          showToast(message, "error");
        } else {
          setUsers(data.data);
          setPagination(data.pagination);
        }
      } catch (err) {
        showToast("Failed to fetch users", "error");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, debouncedSearchTerm]);
  for (let user of users) {
    if (user.profile) {
      let url = signedUrltoNormalUrl(user.profile);
      user.profile = url;
    }
  }
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Filter users based on the active tab
  const filteredUsers = users.filter((user) => {
    if (activeTab === "all") return true;
    return user.tutorStatus === activeTab;
  });

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Tutor Applications
          </h1>
          <p className="text-gray-400">Review and manage tutor applications</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-8 border-b border-gray-700">
          <button
            className={`px-6 py-3 font-medium text-lg transition-all duration-300 border-b-2 ${
              activeTab === "all"
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => {
              setActiveTab("all");
              setCurrentPage(1);
            }}
          >
            All
          </button>
          <button
            className={`px-6 py-3 font-medium text-lg transition-all duration-300 border-b-2 ${
              activeTab === "pending"
                ? "border-yellow-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => {
              setActiveTab("pending");
              setCurrentPage(1);
            }}
          >
            Pending
          </button>
          <button
            className={`px-6 py-3 font-medium text-lg transition-all duration-300 border-b-2 ${
              activeTab === "rejected"
                ? "border-red-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => {
              setActiveTab("rejected");
              setCurrentPage(1);
            }}
          >
            Rejected
          </button>
        </div>

        {/* Search and Content */}
        <div className="mb-6 w-full max-w-md">
          <Search searchTerm={searchTerm} onSearch={handleSearch} />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700/70 text-gray-300 text-sm uppercase">
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      S.No
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Qualification
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Experience
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Subjects
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Certificates
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Application Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user: User, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-700 hover:bg-gray-700/40 transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white font-medium">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                        {user.qualification || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                        {user.experience || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {user.subjects && user.subjects.length > 0 ? (
                          <span className="inline-flex flex-wrap justify-center gap-1">
                            {user.subjects.map((subject, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full"
                              >
                                {subject}
                              </span>
                            ))}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Link
                          href={`/admin/tutor-applications/${user._id}`}
                          onClick={() => {
                            localStorage.setItem("applicant-id", user._id);
                            localStorage.setItem("status", user.tutorStatus);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-medium transition duration-300 inline-flex items-center gap-2"
                        >
                          <FileCheck size={16} />
                          View
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                              user.tutorStatus === "pending"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : user.tutorStatus === "rejected"
                                ? "bg-red-500/20 text-red-300"
                                : "bg-green-500/20 text-green-300"
                            }`}
                          >
                            {user.tutorStatus === "pending" ? (
                              <Info size={14} />
                            ) : user.tutorStatus === "rejected" ? (
                              <XCircle size={14} />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                            {user.tutorStatus.charAt(0).toUpperCase() +
                              user.tutorStatus.slice(1)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 px-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <User className="h-16 w-16 text-gray-500 mb-4" />
            <p className="text-xl font-semibold text-gray-300 mb-2">
              No Tutors Found
            </p>
            <p className="text-gray-400 text-center max-w-md">
              {activeTab === "all"
                ? "There are currently no tutor applications matching your search criteria."
                : `There are currently no tutor applications with ${activeTab} status matching your search criteria.`}
            </p>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorList;
