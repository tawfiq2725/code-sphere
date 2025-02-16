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
    <>
      <Header />
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 pb-10">
        <div className="text-center w-4/5 mt-10">
          <h1 className="text-2xl md:text-5xl font-bold mb-4">
            All the Skills You Need to Succeed in Coding
          </h1>
          <p className="text-lg md:text-xl text-gray-400">
            Master coding with structured, no-fluff courses that take you from
            beginner to pro — designed to build real, practical skills you can
            use every day.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {memberships.map((membership) => (
            <div
              key={membership._id || membership.membershipId}
              className="bg-gray-800 rounded-lg p-8 shadow-lg relative"
            >
              {/* Optional Discount Badge */}
              <span className="absolute top-4 right-4 bg-pink-500 text-xs font-bold text-white px-2 py-1 rounded">
                {membership.label || "Best Value"}
              </span>

              {/* Membership Price */}
              <h2 className="text-4xl font-extrabold">
                {membership.price ? `₹${membership.price}/y` : "$500/y"}
              </h2>

              {/* Original Price (if available) */}
              <p className="text-pink-500 mt-2 text-sm line-through">
                {membership.originalPrice
                  ? `$${membership.originalPrice}/y`
                  : "$6000/y"}
              </p>

              {/* Membership Descriptions */}
              <ul className="mt-6 space-y-3 text-gray-300">
                {Array.isArray(membership.membershipDescription) &&
                  membership.membershipDescription.map((description, index) => (
                    <li key={index}>✔️ {description}</li>
                  ))}
              </ul>

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
              >
                <button className="mt-6 w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg">
                  Start Learning Now
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
