"use client";
import { useState, useEffect } from "react";
import { Orders } from "@/interface/order";
import pdfMake from "pdfmake/build/pdfmake";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { showToast } from "@/utils/toastUtil";
import Pagination from "@/app/components/common/pagination";
import api from "@/api/axios";

pdfMake.vfs = pdfFonts.vfs;

export default function Page() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orderData, setOrderData] = useState<Orders[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [successOrdersCount, setSuccessOrdersCount] = useState(0);
  const [successOrdersTotal, setSuccessOrdersTotal] = useState(0);
  const itemsPerPage = 5;

  // Calculate success order metrics whenever orderData changes
  useEffect(() => {
    const successOrders = orderData.filter(
      (order) => order.orderStatus === "success"
    );
    setSuccessOrdersCount(successOrders.length);

    const totalAmount = successOrders.reduce((sum, order) => {
      return sum + parseFloat(order.totalAmount);
    }, 0);
    setSuccessOrdersTotal(totalAmount);
  }, [orderData]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      return showToast("Please select both start and end date", "error");
    }

    try {
      const res = await api.get(`/api/reports/get-reports/orders`, {
        params: {
          startDate,
          endDate,
        },
      });
      const data = await res.data;

      setOrderData(data.data);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch data", "error");
    }
  };

  const handleDownloadPDF = () => {
    const tableBody = [
      [
        { text: "S.no", bold: true, fillColor: "#4a4a4a", color: "white" },
        { text: "Order ID", bold: true, fillColor: "#4a4a4a", color: "white" },
        { text: "Course ID", bold: true, fillColor: "#4a4a4a", color: "white" },
        {
          text: "Total Amount",
          bold: true,
          fillColor: "#4a4a4a",
          color: "white",
        },
        {
          text: "Order Status",
          bold: true,
          fillColor: "#4a4a4a",
          color: "white",
        },
        {
          text: "Payment Method",
          bold: true,
          fillColor: "#4a4a4a",
          color: "white",
        },
        {
          text: "Coupon Code",
          bold: true,
          fillColor: "#4a4a4a",
          color: "white",
        },
        { text: "Discount", bold: true, fillColor: "#4a4a4a", color: "white" },
        {
          text: "Created Date",
          bold: true,
          fillColor: "#4a4a4a",
          color: "white",
        },
      ],
      ...orderData.map((order, index) => [
        index + 1,
        order.orderId,
        order.courseId,
        `₹${parseFloat(order.totalAmount).toFixed(2)}`,
        order.orderStatus,
        "Razorpay",
        order.couponCode || "N/A",
        order.couponDiscount
          ? `${((parseFloat(order.couponDiscount) ?? 0) * 100).toFixed(0)}%`
          : "N/A",
        new Date(order.createdAt).toLocaleDateString(),
      ]),
    ];

    const documentDefinition: TDocumentDefinitions = {
      content: [
        {
          text: "Code Sphere",
          style: "header",
          alignment: "center",
          margin: [0, 0, 0, 20],
        },
        {
          text: "Order Reports",
          alignment: "left",
          margin: [0, 0, 0, 10],
        },
        {
          text: `Date Range: ${startDate || "N/A"} to ${endDate || "N/A"}`,
          alignment: "left",
          margin: [0, 0, 0, 10],
        },
        {
          text: `Generated on: ${new Date().toLocaleDateString()}`,
          alignment: "left",
          margin: [0, 0, 0, 20],
        },
        {
          table: {
            headerRows: 1,
            widths: [
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
            ],
            body: tableBody,
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0
                ? "#4a4a4a"
                : rowIndex % 2 === 0
                ? "#f2f2f2"
                : "white",
            hLineColor: () => "#aaaaaa",
            vLineColor: () => "#aaaaaa",
          },
        },
        {
          text: "Summary",
          style: "subheader",
          margin: [0, 20, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*"],
            body: [
              [
                {
                  text: "Metric",
                  bold: true,
                  fillColor: "#4a4a4a",
                  color: "white",
                },
                {
                  text: "Value",
                  bold: true,
                  fillColor: "#4a4a4a",
                  color: "white",
                },
              ],
              ["Total Success Orders", successOrdersCount],
              [
                "Total Amount from Success Orders",
                `₹${successOrdersTotal.toFixed(2)}`,
              ],
            ],
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0
                ? "#4a4a4a"
                : rowIndex % 2 === 0
                ? "#f2f2f2"
                : "white",
            hLineColor: () => "#aaaaaa",
            vLineColor: () => "#aaaaaa",
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: "#2d2d2d",
        },
        subheader: {
          fontSize: 14,
          bold: true,
          color: "#2d2d2d",
        },
      },
      defaultStyle: {
        fontSize: 10,
        color: "#333333",
      },
    };

    pdfMake.createPdf(documentDefinition).download("order_report.pdf");
  };

  // Pagination logic
  const totalPages = Math.ceil(orderData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orderData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Custom CSS class for date inputs
  const dateInputClass =
    "bg-black border border-gray-600 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all w-full sm:w-auto";

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8">
      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 tracking-wide">
        Order Reports
      </h1>

      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8 justify-center items-center">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={dateInputClass}
          style={{ colorScheme: "dark", accentColor: "#8b5cf6" }}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={dateInputClass}
          style={{ colorScheme: "dark", accentColor: "#8b5cf6" }}
        />
        <button
          onClick={handleSearch}
          className="bg-gradient-to-r from-purple-700 to-purple-900 text-white py-2 px-4 rounded-md hover:from-purple-600 hover:to-purple-800 transition-all duration-300 w-full sm:w-auto"
        >
          Search
        </button>
        <button
          onClick={handleDownloadPDF}
          className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-2 px-4 rounded-md hover:from-blue-600 hover:to-blue-800 transition-all duration-300 w-full sm:w-auto"
          disabled={orderData.length === 0}
        >
          Download PDF
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-4 text-sm font-semibold rounded-tl-lg">
                Order ID
              </th>
              <th className="p-4 text-sm font-semibold">Course ID</th>
              <th className="p-4 text-sm font-semibold">Total Amount</th>
              <th className="p-4 text-sm font-semibold">Order Status</th>
              <th className="p-4 text-sm font-semibold">Payment Status</th>
              <th className="p-4 text-sm font-semibold">Coupon Code</th>
              <th className="p-4 text-sm font-semibold">Discount</th>
              <th className="p-4 text-sm font-semibold rounded-tr-lg">
                Created Date
              </th>
            </tr>
          </thead>
          <tbody>
            {orderData.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-400">
                  No data available. Please search for orders.
                </td>
              </tr>
            ) : (
              currentOrders.map((order, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-black" : "bg-gray-900"
                  } hover:bg-gray-700 transition-colors duration-200`}
                >
                  <td className="p-4 text-sm border-t border-gray-700">
                    {order.orderId}
                  </td>
                  <td className="p-4 text-sm border-t border-gray-700">
                    {order.courseId}
                  </td>
                  <td className="p-4 text-sm border-t border-gray-700">
                    ₹{parseFloat(order.totalAmount).toFixed(2)}
                  </td>
                  <td className="p-4 text-sm border-t border-gray-700">
                    {order.orderStatus}
                  </td>
                  <td className="p-4 text-sm border-t border-gray-700">
                    {order.paymentStatus}
                  </td>
                  <td className="p-4 text-sm border-t border-gray-700">
                    {order.couponCode || "N/A"}
                  </td>
                  <td className="p-4 text-sm border-t border-gray-700">
                    {order.couponDiscount
                      ? `${(
                          (parseFloat(order.couponDiscount) ?? 0) * 100
                        ).toFixed(0)}%`
                      : "N/A"}
                  </td>
                  <td className="p-4 text-sm border-t border-gray-700">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Summary Section */}
      {orderData.length > 0 && (
        <div className="mt-8 bg-gray-900 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-purple-300">
            Order Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-black p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">Total Success Orders</p>
              <p className="text-2xl font-bold text-white">
                {successOrdersCount}
              </p>
            </div>
            <div className="bg-black p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">
                Total Amount (Success Orders)
              </p>
              <p className="text-2xl font-bold text-white">
                ₹{successOrdersTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {orderData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
