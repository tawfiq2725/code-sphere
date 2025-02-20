"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { showToast } from "@/utils/toastUtil";
import Link from "next/link";
import Pagination from "@/app/components/common/pagination";
import Search from "@/app/components/common/search";
import { backendUrl } from "@/utils/backendUrl";
import { User } from "lucide-react";
import { IPagination } from "@/interface/pagination";
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
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<IPagination | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const usersPerPage = 5;
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = Cookies.get("jwt_token");
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: usersPerPage.toString(),
          search: debouncedSearchTerm,
        });
        const response = await fetch(
          `${backendUrl}/admin/get-tutors/applications?${params}`,
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
          setFilteredUsers(data.data);
        }
      } catch (err) {
        showToast("Failed to fetch users", "error");
        console.error(err);
      }
    };

    fetchUsers();
  }, [currentPage, debouncedSearchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setFilteredUsers(users);
    } else {
      const lowercasedTerm = term.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name.toLowerCase().includes(lowercasedTerm) ||
            user.email.toLowerCase().includes(lowercasedTerm)
        )
      );
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  console.log(users);

  return (
    <div className=" bg-black container mx-auto p-4 flex   flex-col min-h-screen">
      <h1 className="text-3xl text-white font-bold text-center mb-8">
        Tutor Applications
      </h1>
      <div className="mb-6 w-full max-w-md mx-auto">
        <Search searchTerm={searchTerm} onSearch={handleSearch} />
      </div>
      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden mx-20">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700 text-white">
                <tr>
                  <th className=" p-3 text-center">S.No</th>
                  <th className=" p-3 text-center">Name</th>
                  <th className=" p-3 text-center">Email</th>
                  <th className=" p-3 text-center">Qualification</th>
                  <th className=" p-3 text-center">Experience</th>
                  <th className=" p-3 text-center">Subjects</th>
                  <th className=" p-3 text-center">Certificates</th>
                  <th className=" p-3 text-center">Verified</th>
                  <th className=" p-3 text-center">IsTutor</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: User, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                      {user.qualification}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                      {user.experience}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                      {user.subjects.join(", ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                      <Link
                        href={`/admin/tutor-applications/${user._id}`}
                        onClick={() => {
                          localStorage.setItem("applicant-id", user._id);
                        }}
                      >
                        Check
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                      {user.isVerified ? "Yes" : "No"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                      {user.isTutor ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <User className="w-16 h-16 text-gray-500 mb-4" />
            <p className="text-xl text-gray-400">No Tutpr found</p>
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
