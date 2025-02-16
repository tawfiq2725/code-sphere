"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Pagination from "@/app/components/common/pagination";
import { showToast } from "@/utils/toastUtil";
import { useSelector } from "react-redux";
import { getMembershipOrders } from "@/api/admin";
import { MembershipOrder } from "@/interface/membership";
import Link from "next/link";

export default function MembershipManagement() {
  const token: any = Cookies.get("jwt_token");

  const [orders, setOrders] = useState<MembershipOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    getMembershipOrders(token)
      .then((data) => {
        setOrders(data);
      })
      .catch((err) => {
        console.log(err);
        showToast("Failed to fetch orders", "error");
      });
  }, [token]);

  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  return (
    <div className="mx-auto p-4 w-full h-screen flex justify-center items-center bg-black">
      <div className="bg-gray-800 h-max shadow-md rounded-lg overflow-hidden w-full mx-20">
        <div className="p-6 bg-gray-800 border-b flex justify-between">
          <h1 className="text-2xl font-bold text-gray-100">
            Membership Orders
          </h1>
        </div>
        <div className="p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="p-3 border-b">S.No</th>
                <th className="p-3 border-b">Order ID</th>
                <th className="p-3 border-b">Total Amount</th>
                <th className="p-3 border-b">Order Status</th>
                <th className="p-3 border-b">Payment Status</th>
                <th className="p-3 border-b">Start Date</th>
                <th className="p-3 border-b">End Date</th>
                <th className="p-3 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order, index) => (
                <tr key={order._id} className="text-gray-50">
                  <td className="p-3 border-b">
                    {indexOfFirstOrder + index + 1}
                  </td>
                  <td className="p-3 border-b">{order.membershipOrderId}</td>
                  <td className="p-3 border-b">₹{order.totalAmount}</td>
                  <td className="p-3 border-b">{order.orderStatus}</td>
                  <td className="p-3 border-b">{order.paymentStatus}</td>
                  <td className="p-3 border-b">
                    {new Date(order.membershipStartDate).toLocaleDateString()}
                  </td>
                  <td className="p-3 border-b">
                    {new Date(order.membershipEndDate).toLocaleDateString()}
                  </td>
                  <td className="p-3 border-b">
                    <Link
                      href={`/admin/membership-orders/${order.membershipOrderId}`}
                    >
                      <button className="bg-purple-500 px-3 py-1 rounded">
                        Details
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            totalPages={Math.ceil(orders.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            currentPage={currentPage}
          />
        </div>
      </div>
    </div>
  );
}
