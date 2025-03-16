"use client";

import { useEffect, useState } from "react";
import { use } from "react";

import { getOrderById } from "@/api/admin"; // adjust the import path accordingly
import { findUserByIdA } from "@/api/user/user";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  User,
  Clipboard,
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  BookOpen,
  Tag,
  Receipt,
} from "lucide-react";
import { signedUrltoNormalUrl } from "@/utils/presignedUrl";

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
  couponCode?: string;
  couponDiscount?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getOrderById(id)
        .then((response) => {
          setOrder(response);
        })
        .catch((err) => {
          console.error("Failed to fetch order details", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id]);

  useEffect(() => {
    if (order?.userId) {
      findUserByIdA(order.userId)
        .then((response) => {
          setUser(response.data);
        })
        .catch((err) => {
          console.error("Failed to fetch user details", err);
        });
    }
  }, [order?.userId]);
  if (user) {
    user.profile = signedUrltoNormalUrl(user.profile);
  }

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-white">
        <div className="text-center">
          <Clipboard className="h-16 w-16 text-gray-500 mb-4 mx-auto" />
          <p className="text-xl font-semibold text-gray-300 mb-2">
            Order Not Found
          </p>
          <p className="text-gray-400 max-w-md">
            Unable to retrieve the order details.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // Calculate original price before discount (if applicable)
  const discountPercent = order.couponDiscount
    ? parseFloat(order.couponDiscount) * 100
    : 0;
  const totalAfterDiscount = parseFloat(order.totalAmount);
  const originalPrice = order.couponDiscount
    ? (totalAfterDiscount / (1 - parseFloat(order.couponDiscount))).toFixed(2)
    : order.totalAmount;
  const discountAmount = (
    parseFloat(originalPrice) - totalAfterDiscount
  ).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 pt-10">
          <button
            onClick={() => router.back()}
            className="mb-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Order Details
              </h1>
              <p className="text-gray-400">
                Viewing details for Order #{order.orderId}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  order.orderStatus === "success"
                    ? "bg-green-900/30 text-green-400 border border-green-700"
                    : "bg-red-900/30 text-red-400 border border-red-700"
                }`}
              >
                {order.orderStatus === "success"
                  ? "Order Successful"
                  : "Order Failed"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Summary Card */}
          <div className="md:col-span-2 bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center">
                <Receipt className="text-purple-400 mr-3" size={24} />
                <h2 className="text-xl font-semibold text-white">
                  Order Summary
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Order ID</span>
                    <span className="text-white font-medium">
                      {order.orderId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Date Placed</span>
                    <span className="text-white font-medium">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Last Updated</span>
                    <span className="text-white font-medium">
                      {formatDate(order.updatedAt)}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Payment Status</span>
                    <span
                      className={`${
                        order.paymentStatus === "paid" ||
                        order.paymentStatus === "success"
                          ? "text-green-400"
                          : "text-yellow-400"
                      } font-medium flex items-center gap-1`}
                    >
                      {order.paymentStatus === "paid" ||
                      order.paymentStatus === "success" ? (
                        <>
                          <CheckCircle size={16} /> Paid
                        </>
                      ) : (
                        order.paymentStatus
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Coupon Applied</span>
                    <span
                      className={`${
                        order.isApplied ? "text-green-400" : "text-red-400"
                      } font-medium flex items-center gap-1`}
                    >
                      {order.isApplied ? (
                        <>
                          <CheckCircle size={16} /> Applied
                        </>
                      ) : (
                        <>
                          <XCircle size={16} /> Not Applied
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Course ID</span>
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-purple-400" />
                      <span className="text-white font-medium">
                        {order.courseId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info Card */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center">
                <User className="text-purple-400 mr-3" size={24} />
                <h2 className="text-xl font-semibold text-white">
                  Customer Details
                </h2>
              </div>
            </div>
            <div className="p-6">
              {user ? (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 border-purple-500 border-4 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                      <Image
                        src={user.profile || "default-profile.jpg"}
                        width={64}
                        height={64}
                        priority
                        alt="User profile picture"
                        className="w-full h-full object-cover rounded-full" // Add these classes
                      />
                    </div>
                    <h3 className="text-white font-semibold text-lg">
                      {user.name}
                    </h3>
                    <p className="text-gray-400">{user.email}</p>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">User ID</span>
                      <span className="text-white font-mono text-sm">
                        {order.userId}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-gray-700 h-10 w-10"></div>
                    <div className="flex-1 space-y-3 py-1">
                      <div className="h-2 bg-gray-700 rounded"></div>
                      <div className="h-2 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details Card */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Breakdown */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center">
                  <DollarSign className="text-purple-400 mr-3" size={24} />
                  <h2 className="text-xl font-semibold text-white">
                    Price Breakdown
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Original Price</span>
                    <span className="text-white font-medium">
                      ₹{originalPrice}
                    </span>
                  </div>

                  {order.couponCode && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                      <div className="flex items-center">
                        <Tag size={16} className="text-purple-400 mr-2" />
                        <span className="text-gray-400">Coupon Discount</span>
                        <span className="ml-2 px-2 py-0.5 bg-purple-900/50 text-purple-400 rounded text-xs">
                          {order.couponCode}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-red-400 font-medium">
                          -₹{discountAmount}
                        </span>
                        <span className="text-gray-400 text-sm ml-1">
                          ({discountPercent}%)
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-white font-semibold">Total Paid</span>
                    <span className="text-white text-xl font-bold">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Razorpay Payment Details */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center">
                  <CreditCard className="text-purple-400 mr-3" size={24} />
                  <h2 className="text-xl font-semibold text-white">
                    Razorpay Payment Details
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">
                      Razorpay Order ID
                    </p>
                    <div className="flex items-center">
                      <p className="text-white font-mono text-sm break-all flex-1">
                        {order.razorpayOrderId || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">
                      Razorpay Payment ID
                    </p>
                    <p className="text-white font-mono text-sm break-all">
                      {order.razorpayPaymentId || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">
                      Razorpay Signature
                    </p>
                    <p className="text-white font-mono text-sm break-all">
                      {order.razorpaySignature || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
