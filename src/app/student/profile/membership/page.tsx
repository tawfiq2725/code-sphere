"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getMembershipByUserOId } from "@/api/user/user";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";

interface Membership {
  _id: string;
  membershipOrderId: string;
  membershipId: {
    _id: string;
    membershipName: string;
  };
  membershipPlan: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  membershipStatus: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  categoryId: string[];
}

interface User {
  user: {
    _id: string;
  };
}

interface AuthState {
  auth: {
    user: User;
  };
}

export default function Courses() {
  const { user } = useSelector((state: AuthState) => state.auth);
  const [membershipData, setMembershipData] = useState<Membership[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const token = Cookies.get("jwt_token");
  const userId = user.user._id;

  useEffect(() => {
    setLoading(true);
    getMembershipByUserOId(userId)
      .then((response) => {
        setMembershipData(response || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [userId, token]);

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  const formatDate = (dateString?: string): string => {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-purple-900/10 pointer-events-none"></div>

      <main className="relative z-10 mx-auto px-6 md:px-12 lg:px-20 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              My Memberships
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Access your exclusive benefits and premium courses
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-700 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          </div>
        ) : membershipData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {membershipData.map((membership) => (
              <div
                key={membership._id}
                className="bg-gray-800/80 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700/50 group"
              >
                <div className="relative">
                  {/* Gradient overlay for image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10"></div>

                  <img
                    src="/membership.PNG"
                    alt="Membership"
                    className="w-full h-56 object-cover transition-all duration-500 group-hover:scale-105"
                  />

                  {/* Status badge */}
                  <div
                    className={`absolute top-4 right-4 z-20 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      membership.paymentStatus
                    )}`}
                  >
                    {membership.paymentStatus.charAt(0).toUpperCase() +
                      membership.paymentStatus.slice(1)}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors">
                    {membership.membershipId.membershipName} -{" "}
                    {membership.membershipPlan}
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-start space-x-3 text-gray-300">
                      <div className="mt-1 w-4 h-4 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-400"
                        >
                          <rect
                            width="18"
                            height="18"
                            x="3"
                            y="4"
                            rx="2"
                            ry="2"
                          ></rect>
                          <line x1="16" x2="16" y1="2" y2="6"></line>
                          <line x1="8" x2="8" y1="2" y2="6"></line>
                          <line x1="3" x2="21" y1="10" y2="10"></line>
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">Order ID</span>
                        <p className="text-sm font-medium">
                          {membership.membershipOrderId}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 text-gray-300">
                      <div className="mt-1 w-4 h-4 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-400"
                        >
                          <path d="M12 2v10l4.5 4.5"></path>
                          <path d="M16 16h6"></path>
                          <path d="M19 16v6"></path>
                          <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">
                          Total Amount
                        </span>
                        <p className="text-sm font-medium">
                          ₹{membership.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Order Details section */}
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">
                        Order Details
                      </h4>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-gray-300">
                            Order Status: {membership.orderStatus}
                          </span>
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-gray-300">
                            Payment Status: {membership.paymentStatus}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <Link href={`/student/profile/my-courses`}>
                    <div className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-center font-medium transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 mr-2"
                      >
                        <rect width="7" height="7" x="3" y="3" rx="1"></rect>
                        <rect width="7" height="7" x="14" y="3" rx="1"></rect>
                        <rect width="7" height="7" x="14" y="14" rx="1"></rect>
                        <rect width="7" height="7" x="3" y="14" rx="1"></rect>
                      </svg>
                      Explore Courses
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/80 rounded-xl p-10 max-w-2xl mx-auto border border-gray-700/50 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-10 h-10 text-gray-400"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" x2="12" y1="8" y2="12"></line>
                  <line x1="12" x2="12.01" y1="16" y2="16"></line>
                </svg>
              </div>
              <h3 className="text-2xl font-bold">No Memberships Found</h3>
              <p className="text-gray-400 mb-6">
                You don't have any active memberships yet. Unlock premium
                content by purchasing a membership plan.
              </p>
              <Link href="/static/membership">
                <div className="py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-center font-medium transition-all duration-300 cursor-pointer">
                  Explore Membership Plans
                </div>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
