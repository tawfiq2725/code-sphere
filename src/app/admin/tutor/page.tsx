"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { showToast } from "@/utils/toastUtil";
import Pagination from "@/app/components/common/pagination";
import Search from "@/app/components/common/search";
import { backendUrl } from "@/utils/backendUrl";
import type { IPagination } from "@/interface/pagination";
import { User, CheckCircle, XCircle, Shield, ShieldOff } from "lucide-react";

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
        const response = await fetch(
          `${backendUrl}/admin/get-tutors?${params}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
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
      const response = await fetch(`${backendUrl}/admin/block-user/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
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
      const response = await fetch(
        `${backendUrl}/admin/unblock-user/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text text-white">
        Tutor Management
      </h1>
      <div className="mb-6">
        <Search searchTerm={searchTerm} onSearch={setSearchTerm} />
      </div>
      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden mx-20">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Subjects</th>
                  <th className="p-3 text-center">Verified</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="p-3 flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <span>{user.name}</span>
                    </td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {user.subjects.map((subject, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-600 rounded-full text-xs"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-center space-x-2">
                        {user.isVerified ? (
                          <CheckCircle
                            className="w-5 h-5 text-green-500"
                            aria-label="Verified"
                          />
                        ) : (
                          <XCircle
                            className="w-5 h-5 text-red-500"
                            aria-label="Not Verified"
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center space-x-2">
                        {user.isBlocked ? (
                          <Shield
                            className="w-5 h-5 text-red-500"
                            aria-label="Blocked"
                          />
                        ) : (
                          <ShieldOff
                            className="w-5 h-5 text-green-500"
                            aria-label="Active"
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          user.isBlocked
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                        onClick={() =>
                          user.isBlocked
                            ? unblockUser(user._id)
                            : blockUser(user._id)
                        }
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <User className="w-16 h-16 text-gray-500 mb-4" />
            <p className="text-xl text-gray-400">No tutors found</p>
          </div>
        )}
      </div>
      {pagination && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default TutorList;
