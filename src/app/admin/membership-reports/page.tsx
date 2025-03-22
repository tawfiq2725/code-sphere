"use client";
import { useState } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { showToast } from "@/utils/toastUtil";
import Pagination from "@/app/components/common/pagination";
import api from "@/api/axios";
import { MembershipOrder } from "@/interface/membership";
pdfMake.vfs = pdfFonts.vfs;

export default function Page() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [membershipData, setMembershipData] = useState<MembershipOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      return showToast("Please select both start and end date", "error");
    }

    try {
      const res = await api.get(`/api/reports/get-reports/member/orders`, {
        params: {
          startDate,
          endDate,
        },
      });
      const data = await res.data;

      setMembershipData(data.data);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch data", "error");
    }
  };

  const handleDownloadPDF = () => {
    const successOrders = membershipData.filter(
      (membership) => membership.orderStatus === "success"
    );
    const totalSuccessOrders = successOrders.length;
    const totalSuccessAmount = successOrders.reduce(
      (sum, order) => sum + parseFloat(order.totalAmount.toString()),
      0
    );

    const tableBody = [
      [
        { text: "S.no", bold: true, fillColor: "#4a4a4a", color: "white" },
        {
          text: "Membership Order ID",
          bold: true,
          fillColor: "#4a4a4a",
          color: "white",
        },
        {
          text: "Membership Plan",
          bold: true,
          fillColor: "#4a4a4a",
          color: "white",
        },
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
          text: "Payment Status",
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
          text: "Created Date",
          bold: true,
          fillColor: "#4a4a4a",
          color: "white",
        },
      ],
      ...membershipData.map((membership, index) => [
        index + 1,
        membership.membershipOrderId,
        membership.membershipPlan,
        `₹${parseFloat(membership.totalAmount.toString()).toFixed(2)}`,
        membership.orderStatus,
        membership.paymentStatus,
        `Razorpay`,
        new Date(membership.createdAt).toLocaleDateString(),
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
          text: "Membership Reports",
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
              ["Total Successful Orders", totalSuccessOrders.toString()],
              [
                "Total Amount from Successful Orders",
                `₹${totalSuccessAmount.toFixed(2)}`,
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

    pdfMake.createPdf(documentDefinition).download("membership_report.pdf");
  };

  // Calculate success totals
  const successOrders = membershipData.filter(
    (membership) => membership.orderStatus === "success"
  );
  const totalSuccessOrders = successOrders.length;
  const totalSuccessAmount = successOrders
    .reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0)
    .toFixed(2);

  // Pagination logic
  const totalPages = Math.ceil(membershipData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMemberships = membershipData.slice(startIndex, endIndex);

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
        Membership Reports
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
          disabled={membershipData.length === 0}
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
                Membership Order ID
              </th>
              <th className="p-4 text-sm font-semibold">Membership Plan</th>
              <th className="p-4 text-sm font-semibold">Total Amount</th>
              <th className="p-4 text-sm font-semibold">Order Status</th>
              <th className="p-4 text-sm font-semibold">Payment Status</th>
              <th className="p-4 text-sm font-semibold rounded-tr-lg">
                Created Date
              </th>
            </tr>
          </thead>
          <tbody>
            {membershipData.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-400">
                  No data available. Please search for memberships.
                </td>
              </tr>
            ) : (
              currentMemberships.map((membership, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-black" : "bg-gray-900"
                  } hover:bg-gray-700 transition-colors duration-200`}
                >
                  <td className="p-4 text-sm border-t border-gray-700">
                    {membership.membershipOrderId}
                  </td>
                  <td className="p-4 text-sm border-t border-gray-700">
                    {membership.membershipPlan}
                  </td>
                  <td className="p-4 text-sm border-t border-gray-700">
                    ₹{parseFloat(membership.totalAmount.toString()).toFixed(2)}
                  </td>
                  <td className="p-4 text-sm border-t border-gray-700">
                    {membership.orderStatus}
                  </td>
                  <td className="p-4 text-sm border-t border-gray-700">
                    {membership.paymentStatus}
                  </td>
                  <td className="p-4 text-sm border-t border-gray-700">
                    {new Date(membership.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      {membershipData.length > 0 && (
        <div className="mt-8 bg-gray-900 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-purple-300">
            Order Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-black p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">Total Successful Orders</p>
              <p className="text-2xl font-bold text-white">
                {totalSuccessOrders}
              </p>
            </div>
            <div className="bg-black p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">
                Total Amount (Successful Orders)
              </p>
              <p className="text-2xl font-bold text-white">
                ₹{totalSuccessAmount}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {membershipData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
