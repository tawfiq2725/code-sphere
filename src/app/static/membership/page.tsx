"use client";

import { getMemberships } from "@/api/user/user";
import Header from "@/app/components/header";
import { useEffect, useState } from "react";
import { Memberships } from "@/interface/membership";
import Link from "next/link";

export default function Pricing() {
  const [memberships, setMemberships] = useState<Memberships[]>([]);

  useEffect(() => {
    getMemberships()
      .then((data) => {
        setMemberships(data);
      })
      .catch((err) => {
        console.error("Error fetching memberships:", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Header />
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 mb-6">
            Unlock Your Coding Potential
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Transform your coding journey with meticulously crafted courses that
            bridge theory and real-world application. From beginner to pro,
            we've got your learning path covered.
          </p>
        </div>

        {/* Membership Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {memberships.map((membership) => (
            <div
              key={membership._id || membership.membershipId}
              className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 shadow-2xl transform transition-all duration-300  hover:shadow-2xl hover:border-pink-500"
            >
              {/* Membership Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-pink-400">
                  {membership.membershipName}
                </h2>
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-xs font-bold text-white px-3 py-1 rounded-full">
                  {membership.label || "Best Value"}
                </span>
              </div>

              {/* Price */}
              <div className="text-5xl font-extrabold mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
                  ₹{membership.price || 500}
                  <span className="text-xl text-gray-400">/year</span>
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {membership.membershipDescription &&
                  membership.membershipDescription
                    .split(" , ")
                    .map((description, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <svg
                          className="w-6 h-6 text-pink-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-gray-300">{description}</span>
                      </li>
                    ))}
              </ul>

              {/* CTA Button */}
              <Link
                href={`/student/enroll-membership/${membership.membershipId}`}
                onClick={() => {
                  localStorage.setItem(
                    "membershipId",
                    membership.price.toString()
                  );
                  localStorage.setItem(
                    "membershipName",
                    membership.membershipName
                  );
                }}
                className="block"
              >
                <button className="w-full py-4 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                  Start Your Learning Journey
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
