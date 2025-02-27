"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { showToast } from "@/utils/toastUtil";
import Pagination from "@/app/components/common/pagination";
import Search from "@/app/components/common/search";
import type { IPagination } from "@/interface/pagination";
import { User, CheckCircle, XCircle, Shield, ShieldOff } from "lucide-react";
import api from "@/api/axios";

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
    profile: string;
    name: string;
    email: string;
    isVerified: boolean;
    isBlocked: boolean;
    isTutor: boolean;
    qualification: string;
    experience: string;
    subjects: string[];
    certfications: string[];
  }

  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<IPagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const usersPerPage = 5;
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const token = Cookies.get("jwt_token");
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: usersPerPage.toString(),
          search: debouncedSearchTerm,
        });
        const response = await api.get(`/admin/get-tutors`, { params });

        const data = await response.data;
        if (!data.success) {
          showToast(data.message, "error");
        } else {
          setUsers(data.data.data);
          setPagination(data.data.pagination);
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

  const blockUser = async (userId: string) => {
    try {
      const token = Cookies.get("jwt_token");
      const response = await api.patch(`/admin/block-user/${userId}`);
      const data = await response.data;
      if (data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, isBlocked: true } : user
          )
        );
        showToast("Tutor blocked successfully", "success");
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast("Failed to block tutor", "error");
      console.error(err);
    }
  };

  const unblockUser = async (userId: string) => {
    try {
      const token = Cookies.get("jwt_token");
      const response = await api.patch(`/admin/unblock-user/${userId}`);
      const data = await response.data;
      if (data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, isBlocked: false } : user
          )
        );
        showToast("Tutor unblocked successfully", "success");
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast("Failed to unblock tutor", "error");
      console.error(err);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Tutor Management
          </h1>
          <p className="text-gray-400">View and manage active tutors</p>
        </div>

        {/* Search and Content */}
        <div className="mb-6 w-full max-w-md">
          <Search searchTerm={searchTerm} onSearch={setSearchTerm} />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700/70 text-gray-300 text-sm uppercase">
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      S.No
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Profile
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Subjects
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Verified
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user._id}
                      className="border-b border-gray-700 hover:bg-gray-700/40 transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center">
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <img
                              src={user.profile}
                              alt={`${user.name}'s profile`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white font-medium">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {user.subjects && user.subjects.length > 0 ? (
                          <span className="inline-flex flex-wrap justify-center gap-1">
                            {user.subjects.map((subject, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-purple-500 text-gray-50 text-xs rounded-full"
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
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">
                            <CheckCircle size={14} />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm">
                            <XCircle size={14} />
                            Not Verified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {user.isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm">
                            <Shield size={14} />
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">
                            <ShieldOff size={14} />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          className={`px-4 py-2 rounded-lg font-medium transition duration-300 inline-flex items-center gap-2 ${
                            user.isBlocked
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                              : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                          }`}
                          onClick={() =>
                            user.isBlocked
                              ? unblockUser(user._id)
                              : blockUser(user._id)
                          }
                        >
                          {user.isBlocked ? (
                            <>
                              <ShieldOff size={16} />
                              Unblock
                            </>
                          ) : (
                            <>
                              <Shield size={16} />
                              Block
                            </>
                          )}
                        </button>
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
              There are currently no tutors matching your search criteria.
            </p>
          </div>
        )}

        {pagination && (
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
