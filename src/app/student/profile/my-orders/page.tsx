"use client";

import { useEffect, useRef, useState } from "react";
import Pagination from "@/app/components/common/pagination";
import { getUserOrders } from "@/api/user/user";
import { showToast } from "@/utils/toastUtil";
import { useSelector } from "react-redux";

export default function EnhancedOrderManagement() {
  interface Order {
    serialNo?: number;
    orderId?: string;
    courseId?: string;
    thumbnail?: string;
    totalAmount: number | string;
    paymentStatus: string;
    orderStatus: string;
  }

  interface MembershipOrder extends Order {
    _id: string;
    membershipOrderId: string;
    membershipId: string;
    userId: string;
    categoryId: string[];
    membershipPlan: string;
    createdAt: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  }

  const { user } = useSelector((state: any) => state.auth);
  const [regularOrders, setRegularOrders] = useState<Order[]>([]);
  const [membershipOrders, setMembershipOrders] = useState<MembershipOrder[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState<"orders" | "memberships">(
    "orders"
  );
  const [isLoading, setIsLoading] = useState(true);
  const userId: string = user.user._id;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await getUserOrders(userId);

      if (response.success && response.data) {
        setRegularOrders(response.data.orders || []);
        setMembershipOrders(response.data.membershipOrders || []);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems =
    activeTab === "orders"
      ? regularOrders.slice(indexOfFirstItem, indexOfLastItem)
      : membershipOrders.slice(indexOfFirstItem, indexOfLastItem);

  const totalItems =
    activeTab === "orders" ? regularOrders.length : membershipOrders.length;

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const renderStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

    if (status === "success") {
      return (
        <span className={`${baseClasses} bg-green-900 text-green-200`}>
          Success
        </span>
      );
    } else {
      return (
        <span className={`${baseClasses} bg-red-900 text-red-200`}>Failed</span>
      );
    }
  };

  const renderEmptyState = () => (
    <div className="p-6 text-center">
      <div className="flex flex-col items-center justify-center py-12">
        <svg
          className="w-16 h-16 text-gray-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </svg>
        <h3 className="text-xl font-medium text-gray-300 mb-2">
          No orders found
        </h3>
        <p className="text-gray-400">
          You haven't made any{" "}
          {activeTab === "orders" ? "course orders" : "membership purchases"}{" "}
          yet.
        </p>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="p-6 text-center">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <h3 className="text-xl font-medium text-gray-300">Loading orders...</h3>
      </div>
    </div>
  );

  const renderOrdersTable = () => {
    if (isLoading) {
      return renderLoadingState();
    }

    if (currentItems.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar pb-5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900 text-gray-300">
              <th className="p-3 border-b border-gray-700 rounded-tl-lg">#</th>
              {activeTab === "orders" ? (
                <>
                  <th className="p-3 border-b border-gray-700">Order ID</th>
                  <th className="p-3 border-b border-gray-700">Course ID</th>
                </>
              ) : (
                <>
                  <th className="p-3 border-b border-gray-700">
                    Membership ID
                  </th>
                  <th className="p-3 border-b border-gray-700">Plan</th>
                  <th className="p-3 border-b border-gray-700">Date</th>
                </>
              )}
              <th className="p-3 border-b border-gray-700">Amount</th>
              <th className="p-3 border-b border-gray-700">Payment</th>
              <th className="p-3 border-b border-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr
                key={index}
                className="text-gray-300 hover:bg-gray-700 transition duration-150"
              >
                <td className="p-3 border-b border-gray-700">
                  {indexOfFirstItem + index + 1}
                </td>

                {activeTab === "orders" ? (
                  <>
                    <td className="p-3 border-b border-gray-700 font-medium">
                      {(item as Order).orderId}
                    </td>
                    <td className="p-3 border-b border-gray-700">
                      {(item as Order).courseId}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-3 border-b border-gray-700 font-medium">
                      {(item as MembershipOrder).membershipOrderId}
                    </td>
                    <td className="p-3 border-b border-gray-700">
                      <span className="bg-indigo-900 text-indigo-200 px-2 py-1 rounded-md text-xs">
                        {(item as MembershipOrder).membershipPlan}
                      </span>
                    </td>
                    <td className="p-3 border-b border-gray-700">
                      {formatDate((item as MembershipOrder).createdAt)}
                    </td>
                  </>
                )}

                <td className="p-3 border-b border-gray-700">
                  ₹{item.totalAmount}
                </td>
                <td className="p-3 border-b border-gray-700">
                  {renderStatusBadge(item.paymentStatus)}
                </td>
                <td className="p-3 border-b border-gray-700">
                  {renderStatusBadge(item.orderStatus)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalItems > itemsPerPage && (
          <div className="mt-4">
            <Pagination
              totalPages={Math.ceil(totalItems / itemsPerPage)}
              onPageChange={paginate}
              currentPage={currentPage}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto p-4 w-full min-h-screen flex justify-center items-start bg-black">
      <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden w-11/12 lg:w-9/12 border border-gray-700">
        <div className="p-6 bg-gray-800 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            My Purchases
          </h1>
          <p className="text-sm text-gray-400">
            View and manage all your orders and subscriptions
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => {
              setActiveTab("orders");
              setCurrentPage(1);
            }}
            className={`flex-1 py-4 px-6 text-center transition-colors duration-200 ${
              activeTab === "orders"
                ? "text-indigo-400 border-b-2 border-indigo-500 font-medium"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Course Orders
            <span className="ml-2 bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
              {regularOrders.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("memberships");
              setCurrentPage(1);
            }}
            className={`flex-1 py-4 px-6 text-center transition-colors duration-200 ${
              activeTab === "memberships"
                ? "text-indigo-400 border-b-2 border-indigo-500 font-medium"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Memberships
            <span className="ml-2 bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
              {membershipOrders.length}
            </span>
          </button>
        </div>

        <div className="p-6">{renderOrdersTable()}</div>
      </div>
    </div>
  );
}
