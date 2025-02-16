"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Cookies from "js-cookie";
import { getOrderById } from "@/api/admin"; // adjust the import path accordingly
import { findUserById } from "@/api/user/user";
import { useRouter } from "next/navigation";

// Define the interface for the order details based on your response
interface OrderDetails {
  _id: string;
  orderId: string;
  userId: string;
  courseId: string;
  totalAmount: string;
  orderStatus: string;
  paymentStatus: string;
  isApplied: boolean;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const token = Cookies.get("jwt_token") || "";
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      getOrderById(token, id)
        .then((response) => {
          // Assuming your API response is like { data: { ...order } }
          setOrder(response);
        })
        .catch((err) => {
          console.error("Failed to fetch order details", err);
        });
    }
  }, [id, token]);

  // Only run when order?.userId changes (not the entire order object)
  useEffect(() => {
    if (order?.userId) {
      findUserById(order.userId)
        .then((response) => {
          console.log(response);
          setUser(response.data);
        })
        .catch((err) => {
          console.error("Failed to fetch user details", err);
        });
    }
  }, [order?.userId]);

  if (!order) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <p className="text-white">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 flex justify-center items-center">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">Order Details</h1>
        <button
          onClick={() => router.back()}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded my-3"
        >
          Back
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Overview */}
          <div className="bg-gray-50 p-4 rounded">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Order Overview
            </h2>
            <p>
              <span className="font-bold">Order ID:</span> {order.orderId}
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
              <span className="font-bold">Applied:</span>{" "}
              {order.isApplied ? "Yes" : "No"}
            </p>
          </div>

          {/* Course & User Info */}
          <div className="bg-gray-50 p-4 rounded">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Course & User Info
            </h2>
            <p>
              <span className="font-bold">User Name:</span>{" "}
              {user ? user.name : "Loading..."}
            </p>
            <p>
              <span className="font-bold">Course ID:</span> {order.courseId}
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
