"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Cookies from "js-cookie";
import { getMembershipOrderById } from "@/api/admin";
import { useRouter } from "next/navigation";
interface MembershipOrder {
  _id: string;
  membershipOrderId: string;
  membershipId: {
    _id: string;
    membershipName: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  categoryId: {
    _id: string;
    categoryName: string;
  };
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  membershipStartDate: string;
  membershipEndDate: string;
  membershipStatus: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export default function MembershipOrders({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap the params promise to get the order id
  const { id } = use(params);
  const [order, setOrder] = useState<MembershipOrder | null>(null);
  const token = Cookies.get("jwt_token") || "";
  const router = useRouter();
  useEffect(() => {
    if (id) {
      getMembershipOrderById(token)
        .then((response) => {
          setOrder(response);
        })
        .catch((err) => {
          console.error("Failed to fetch membership order details", err);
        });
    }
  }, [id, token]);

  if (!order) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <p className="text-white">Loading membership order details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 flex items-center justify-center">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">
          Membership Order Details
        </h1>
        <div>
          <button
            onClick={() => {
              router.back();
            }}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded my-3"
          >
            Back
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Order Overview
            </h2>
            <p>
              <span className="font-bold">Order ID:</span>{" "}
              {order.membershipOrderId}
            </p>
            <p>
              <span className="font-bold">Total Amount:</span> ₹
              {order.totalAmount}
            </p>
            <p>
              <span className="font-bold">Order Status:</span>{" "}
              {order.orderStatus}
            </p>
            <p>
              <span className="font-bold">Payment Status:</span>{" "}
              {order.paymentStatus}
            </p>
            <p>
              <span className="font-bold">Membership Status:</span>{" "}
              {order.membershipStatus}
            </p>
          </div>

          {/* User & Membership Info */}
          <div className="bg-gray-50 p-4 rounded">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              User & Membership Info
            </h2>
            <p>
              <span className="font-bold">User Name:</span> {order.userId.name}
            </p>
            <p>
              <span className="font-bold">User Email:</span>{" "}
              {order.userId.email}
            </p>
            <p>
              <span className="font-bold">Membership Plan:</span>{" "}
              {order.membershipId.membershipName}
            </p>
            <p>
              <span className="font-bold">Category:</span>{" "}
              {order.categoryId.categoryName}
            </p>
            <p>
              <span className="font-bold">Start Date:</span>{" "}
              {new Date(order.membershipStartDate).toLocaleDateString()}
            </p>
            <p>
              <span className="font-bold">End Date:</span>{" "}
              {new Date(order.membershipEndDate).toLocaleDateString()}
            </p>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 p-4 rounded md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Payment Details (Razorpay)
            </h2>
            <p>
              <span className="font-bold">Razorpay Order ID:</span>{" "}
              {order.razorpayOrderId}
            </p>
            <p>
              <span className="font-bold">Razorpay Payment ID:</span>{" "}
              {order.razorpayPaymentId}
            </p>
            <p>
              <span className="font-bold">Razorpay Signature:</span>{" "}
              {order.razorpaySignature}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
