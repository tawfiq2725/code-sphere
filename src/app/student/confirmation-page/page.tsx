"use client";
import Link from "next/link";

export default function OrderConfirmation() {
  const orderId = localStorage.getItem("orderId");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6">
      <div className="bg-gray-800 shadow-lg rounded-2xl p-8 max-w-lg text-center">
        <h1 className="text-2xl font-bold text-gray-50">Congratulations!</h1>
        <p className="text-gray-50 mt-4 text-lg">
          Your order has been placed successfully.
        </p>
        {orderId && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-300">
            <p className="text-gray-700 font-medium">Your Order ID:</p>
            <p className="text-lg font-semibold text-gray-900">{orderId}</p>
          </div>
        )}
        <Link href="/student/profile/my-profile">
          <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition">
            Explore Your Course
          </button>
        </Link>
      </div>
    </div>
  );
}
