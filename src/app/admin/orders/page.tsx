"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Cookies from "js-cookie";
import Pagination from "@/app/components/common/pagination";
import { getUserOrders } from "@/api/user/user";
import { showToast } from "@/utils/toastUtil";
import { useSelector } from "react-redux";
import { getAllorders } from "@/api/order/order";
import Link from "next/link";
import { InfoIcon } from "lucide-react";

export default function SimpleCourseManagement() {
  interface Orders {
    serialNo: number;
    orderId: string;
    userId: string;
    courseId: string;
    thumbnail: string;
    price: number;
    totalAmount: string;
    paymentStatus: string;
    orderStatus: string;
  }
  const token: any = Cookies.get("jwt_token");
  const { user } = useSelector((state: any) => state.auth);
  const [orders, setOrders] = useState<Orders[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    getAllorders(token)
      .then((data) => {
        setOrders(data.data);
        showToast("Orders fetched successfully", "success");
      })
      .catch((err) => {
        console.log(err);
        showToast("Failed to fetch orders", "error");
      })
      .finally(() => {
        console.log("Orders fetched");
      });
  }, [token]);

  const indexOfLastCourse = currentPage * itemsPerPage;
  const indexOfFirstCourse = indexOfLastCourse - itemsPerPage;
  let currentCourses: Orders[] = [];
  if (orders !== null) {
    currentCourses = orders.slice(indexOfFirstCourse, indexOfLastCourse);
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (currentCourses.length === 0) {
    return (
      <div className=" mx-auto p-4 w-full h-screen flex  justify-center bg-black">
        <div className="bg-gray-800 h-max  shadow-md rounded-lg overflow-hidden w-8/12">
          <div className="p-6 bg-gray-800 border-b">
            <h1 className="text-2xl font-bold text-gray-100">My Orders</h1>
            <p className="text-sm text-gray-100">
              To see the details of the orders
            </p>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar pb-5">
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="text-gray-50">
                    <td className="p-3 border-b">No Orders Found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" mx-auto p-4 w-full h-screen flex  justify-center bg-black">
      <div className="bg-gray-800 h-max  shadow-md rounded-lg overflow-hidden w-8/12">
        <div className="p-6 bg-gray-800 border-b">
          <h1 className="text-2xl font-bold text-gray-100">Total Orders</h1>
          <p className="text-sm text-gray-100">
            To see the details of the orders
          </p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar pb-5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-3 border-b">S.No</th>
                  <th className="p-2 border-b">Order Id</th>
                  <th className="p-3 border-b">Course Id</th>
                  <th className="p-3 border-b">Total </th>
                  <th className="p-3 border-b hidden sm:table-cell">
                    Order Status
                  </th>
                  <th className="p-3 border-b">Details </th>
                </tr>
              </thead>
              <tbody>
                {currentCourses.map((order, index) => (
                  <tr key={order.orderId} className="text-gray-50">
                    <td className="p-3 border-b">{index + 1}</td>
                    <td className="p-3 border-b">{order.orderId}</td>
                    <td className="p-3 border-b">{order.courseId}</td>
                    <td className="p-3 border-b">₹{order.totalAmount}</td>
                    <td className="p-3 border-b hidden sm:table-cell">
                      {order.orderStatus === "success" ? (
                        <span className="text-green-500">Success</span>
                      ) : (
                        <span className="text-red-500">Failed</span>
                      )}
                    </td>
                    <td className="p-3 border-b hidden sm:table-cell">
                      <Link href={`/admin/orders/${order.orderId}`}>
                        <InfoIcon size={24} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              totalPages={Math.ceil(orders.length / itemsPerPage)}
              onPageChange={paginate}
              currentPage={currentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
