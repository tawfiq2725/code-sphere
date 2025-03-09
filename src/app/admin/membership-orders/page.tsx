"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Pagination from "@/app/components/common/pagination";
import { showToast } from "@/utils/toastUtil";
import { getMembershipOrders } from "@/api/admin";
import { MembershipOrder } from "@/interface/membership";
import Link from "next/link";
import { InfoIcon, CreditCard, FileText, Award } from "lucide-react";

export default function MembershipManagement() {
  const token: any = Cookies.get("jwt_token");

  const [orders, setOrders] = useState<MembershipOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getMembershipOrders(token)
      .then((data) => {
        setOrders(data);
      })
      .catch((err) => {
        console.log(err);
        showToast("Failed to fetch membership orders", "error");
      })
      .finally(() => {
        console.log("Membership orders fetched");
        setIsLoading(false);
      });
  }, [token]);

  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  let currentOrders: MembershipOrder[] = [];
  if (orders.length > 0) {
    currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 pt-10">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Membership Management
          </h1>
          <p className="text-gray-400">
            Track and manage customer membership orders
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : currentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <Award className="h-16 w-16 text-gray-500 mb-4" />
            <p className="text-xl font-semibold text-gray-300 mb-2">
              No Membership Orders Found
            </p>
            <p className="text-gray-400 text-center max-w-md">
              There are currently no membership orders in the system.
            </p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700/70 text-gray-300 text-sm uppercase">
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      S.No
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Order Status
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order, index) => (
                    <tr
                      key={order._id}
                      className="border-b border-gray-700 hover:bg-gray-700/40 transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                        {indexOfFirstOrder + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white font-medium">
                        {order.membershipOrderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                        ₹{order.totalAmount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {order.orderStatus === "success" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">
                            <CreditCard size={14} />
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm">
                            <FileText size={14} />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {order.paymentStatus === "paid" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-sm">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                        {new Date(
                          order.membershipStartDate
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                        {new Date(order.membershipEndDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Link
                          href={`/admin/membership-orders/${order.membershipOrderId}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                        >
                          <InfoIcon size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {orders.length > itemsPerPage && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(orders.length / itemsPerPage)}
              onPageChange={paginate}
            />
          </div>
        )}
      </div>
    </div>
  );
}
