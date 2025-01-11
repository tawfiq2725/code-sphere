"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { showToast } from "@/utils/toastUtil";

const UserLists = () => {
  interface User {
    _id: string;
    name: string;
    email: string;
    isVerified: boolean;
    isBlocked: boolean;
  }

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let token = Cookies.get("jwt_token");
        const response = await fetch("http://localhost:5000/admin/get-users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!data.success) {
          showToast(data.message, "error");
        } else {
          setUsers(data.data);
          showToast("Users fetched successfully", "success");
        }
      } catch (err) {
        showToast("Failed to fetch users", "error");
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  const blockUser = async (userId: string) => {
    try {
      let token = Cookies.get("jwt_token");
      console.log(token);
      const response = await fetch(
        `http://localhost:5000/admin/block-user/${userId}`,
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
            user._id === userId ? { ...user, isBlocked: true } : user
          )
        );
        showToast("User blocked successfully", "success");
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast("Failed to block user", "error");
      console.error(err);
    }
  };

  const unblockUser = async (userId: string) => {
    try {
      let token = Cookies.get("jwt_token");
      const response = await fetch(
        `http://localhost:5000/admin/unblock-user/${userId}`,
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
        showToast("User unblocked successfully", "success");
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast("Failed to unblock user", "error");
      console.error(err);
    }
  };
  console.log(users);

  return (
    <div className="container mx-auto p-4 text-center flex justify-center items-center flex-col h-screen">
      <h1 className="text-2xl font-bold my-4">User List</h1>
      <table className="w-4/5 table-auto border-collapse border border-gray-300 text-center">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Verified</th>
            <th className="border px-4 py-2">Blocked</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: User, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{user.name}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">
                {user.isVerified ? "Yes" : "No"}
              </td>
              <td className="border px-4 py-2">
                {user.isBlocked ? "Yes" : "No"}
              </td>
              <td className="border px-4 py-2">
                {user.isBlocked ? (
                  <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => unblockUser(user._id)}
                  >
                    Unblock
                  </button>
                ) : (
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => blockUser(user._id)}
                  >
                    Block
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserLists;
