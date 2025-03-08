"use client";
import { useState } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { showToast } from "@/utils/toastUtil";
import Pagination from "@/app/components/common/pagination";
import api from "@/api/axios";
import { text } from "stream/consumers";

// Define interface for membership data
interface MembershipOrders {
  _id: string;
  membershipOrderId: string;
  membershipId: string;
  userId: string;
  categoryId: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  membershipEndDate: string;
  membershipStartDate: string;
  membershipStatus: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

pdfMake.vfs = pdfFonts.vfs;

export default function Page() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [membershipData, setMembershipData] = useState<MembershipOrders[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      return showToast("Please select both start and end date", "error");
    }
    console.log(`Searching from ${startDate} to ${endDate}`);
    try {
      const res = await api.get(`/api/reports/get-reports/member/orders`, {
        params: {
          startDate,
          endDate,
        },
      });
      const data = await res.data;
      console.log(data.data);
      setMembershipData(data.data);
      setCurrentPage(1); // Reset to first page after new search
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch data", "error");
    }
  };

  const handleDownloadPDF = () => {
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
          text: "Total Amount",
          bold: true,
          fillColor: "#4a4a4a",
          color: "white",
        },
        { text: "Status", bold: true, fillColor: "#4a4a4a", color: "white" },
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
          text: "Start Date",
          bold: true,
          fillColor: "#4a4a4a",
          color: "white",
        },
        { text: "End Date", bold: true, fillColor: "#4a4a4a", color: "white" },
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
        `₹${parseFloat(membership.totalAmount.toString()).toFixed(2)}`,
        membership.membershipStatus,
        membership.paymentStatus,
        `Razorpay`,
        new Date(membership.membershipStartDate).toLocaleDateString(),
        new Date(membership.membershipEndDate).toLocaleDateString(),
        new Date(membership.createdAt).toLocaleDateString(), // Added the 9th column
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
      ],
      styles: {
        header: {
          fontSize: 18,
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

  // Pagination logic
  const totalPages = Math.ceil(membershipData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMemberships = membershipData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
          className="bg-black border border-gray-600 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all w-full sm:w-auto"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-black border border-gray-600 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all w-full sm:w-auto"
        />
        <button
          onClick={handleSearch}
          className="bg-gradient-to-r from-gray-700 to-gray-900 text-white py-2 px-4 rounded-md hover:from-gray-600 hover:to-gray-800 transition-all duration-300 w-full sm:w-auto"
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
              <th className="p-4 text-sm font-semibold">Total Amount</th>
              <th className="p-4 text-sm font-semibold">Membership Status</th>
              <th className="p-4 text-sm font-semibold">Payment Status</th>
              <th className="p-4 text-sm font-semibold">Start Date</th>
              <th className="p-4 text-sm font-semibold">End Date</th>
              <th className="p-4 text-sm font-semibold rounded-tr-lg">
                Created Date
              </th>
            </tr>
          </thead>
          <tbody>
            {membershipData.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-400">
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
                    ₹{parseFloat(membership.totalAmount.toString()).toFixed(2)}
                  </td>
                  <td className="p-4 text-sm border-t border-gray-700">
                    {membership.membershipStatus}
                  </td>
                  <td className="p-4 text-sm border-t border-gray-700">
                    {membership.paymentStatus}
                  </td>
                  <td className="p-4 text-sm border-t border-gray-700">
                    {new Date(
                      membership.membershipStartDate
                    ).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm border-t border-gray-700">
                    {new Date(
                      membership.membershipEndDate
                    ).toLocaleDateString()}
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
