"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { showToast } from "@/utils/toastUtil";
import Link from "next/link";
import Pagination from "@/app/components/common/pagination";
import Search from "@/app/components/common/search";
import { backendUrl } from "@/utils/backendUrl";
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
  const usersPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = Cookies.get("jwt_token");
        const response = await fetch(
          `${backendUrl}/admin/get-tutors/applications`,
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
          setUsers(data.data);
          setFilteredUsers(data.data);
        }
      } catch (err) {
        showToast("Failed to fetch users", "error");
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

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
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  console.log(users);

  return (
    <div className="container mx-auto p-4 text-center flex justify-center items-center flex-col h-screen">
      <h1 className="text-2xl font-bold my-4">New Applicants</h1>
      <Search searchTerm={searchTerm} onSearch={handleSearch} />

      <div className="w-full overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300 text-center">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">S.No</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Qualification</th>
              <th className="border px-4 py-2">Experience</th>
              <th className="border px-4 py-2">Subjects</th>
              <th className="border px-4 py-2">Certificates</th>
              <th className="border px-4 py-2">Verified</th>
              <th className="border px-4 py-2">IsTutor</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user: User, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">{user.name}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.qualification}</td>
                <td className="border px-4 py-2">{user.experience}</td>
                <td className="border px-4 py-2">{user.subjects.join(", ")}</td>
                <td className="border px-4 py-2">
                  <Link
                    href={`/admin/tutor-applications/${user._id}`}
                    onClick={() => {
                      localStorage.setItem("applicant-id", user._id);
                    }}
                  >
                    Check
                  </Link>
                </td>
                <td className="border px-4 py-2">
                  {user.isVerified ? "Yes" : "No"}
                </td>
                <td className="border px-4 py-2">
                  {user.isTutor ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default TutorList;
