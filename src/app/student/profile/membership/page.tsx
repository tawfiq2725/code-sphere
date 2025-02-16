"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getMembershipByUserId } from "@/api/user/user";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";

export default function Courses() {
  const { user } = useSelector((state: any) => state.auth);
  const [membershipData, setMembershipData] = useState<any[]>([]); // Store membership data
  const token = Cookies.get("jwt_token");
  const userId = user.user._id;

  useEffect(() => {
    getMembershipByUserId(userId, token)
      .then((data) => {
        console.log(data, "Membership data");
        setMembershipData(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [userId]);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto px-20 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">My Memberships</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {membershipData.length > 0 ? (
            membershipData.map((membership) => (
              <div
                key={membership._id}
                className="w-80 bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-200"
              >
                <img
                  src={"/membership.PNG"}
                  alt={membership.membershipId.membershipName}
                  className="w-full h-48 object-cover hover:scale-110 transition-transform"
                />
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">
                    {membership.membershipId.membershipName}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Status:{" "}
                    {membership.membershipStatus.charAt(0).toUpperCase() +
                      membership.membershipStatus.slice(1)}
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    Start Date:{" "}
                    {new Date(
                      membership.membershipStartDate
                    ).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    End Date:{" "}
                    {new Date(
                      membership.membershipEndDate
                    ).toLocaleDateString()}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-50">
                      <Link href={`/student/profile/my-courses`}>
                        Explore Courses
                      </Link>
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 text-lg col-span-full">
              No memberships found.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
