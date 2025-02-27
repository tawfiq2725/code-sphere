"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Pagination from "@/app/components/common/pagination";
import { showToast } from "@/utils/toastUtil";
import { useSelector } from "react-redux";
import {
  getCoupons,
  addCoupon,
  updateCoupon,
  toggleCoupon,
} from "@/api/coupon/coupon";
import { Tag, Edit, Archive, CheckCircle, Plus } from "lucide-react";

export default function CouponManagement() {
  interface Coupon {
    _id: string;
    couponName: string;
    couponCode: string;
    couponDiscount: number;
    startDate: Date;
    expireAt: Date;
    couponStatus: boolean;
  }

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [couponData, setCouponData] = useState({
    couponName: "",
    couponCode: "",
    couponDiscount: 0,
    expireAt: "",
  });

  useEffect(() => {
    setIsLoading(true);
    getCoupons()
      .then((data) => {
        setCoupons(data.data);
      })
      .catch((err) => {
        console.error("Failed to fetch coupons data:", err);
        showToast("Failed to fetch coupon data", "error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleToggleCoupon = async (id: string) => {
    await toggleCoupon(id);
    setCoupons((prev) =>
      prev.map((c) =>
        c._id === id ? { ...c, couponStatus: !c.couponStatus } : c
      )
    );
  };

  const handleAddCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !couponData.couponName ||
      !couponData.couponCode ||
      !couponData.couponDiscount ||
      !couponData.expireAt
    ) {
      return showToast("Please fill all the fields", "error");
    }

    if (couponData.couponDiscount <= 0 || couponData.couponDiscount >= 100) {
      return showToast("Please enter a valid discount value", "error");
    }

    if (new Date(couponData.expireAt) < new Date()) {
      return showToast("Please enter a valid expiry date", "error");
    }

    const couponRegex = /^[A-Za-z0-9]{6,10}$/;
    if (!couponRegex.test(couponData.couponCode)) {
      return showToast(
        "Please enter a valid coupon code (6-10 alphanumeric characters, no spaces or special characters)",
        "error"
      );
    }

    await addCoupon(couponData)
      .then((data) => {
        getCoupons()
          .then((data) => {
            setCoupons(data.data);
          })
          .catch((err) => {
            console.error("Failed to fetch coupons data:", err);
            showToast("Failed to fetch coupon data", "error");
          })
          .finally(() => {
            setIsLoading(false);
          });

        setIsAddModalOpen(false);
        showToast("Coupon added successfully", "success");
        setCouponData({
          couponName: "",
          couponCode: "",
          couponDiscount: 0,
          expireAt: "",
        });
      })
      .catch((err) => {
        console.error("Failed to add coupon:", err);
        showToast("Failed to add coupon", "error");
      });
  };

  const handleUpdateCoupon = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedCoupon) {
      showToast("No coupon selected for editing", "error");
      return;
    }
    if (
      couponData.couponName === "" ||
      couponData.couponCode === "" ||
      couponData.couponDiscount === 0 ||
      couponData.expireAt === ""
    ) {
      return showToast("Please fill all the fields", "error");
    }
    if (couponData.couponDiscount <= 0 || couponData.couponDiscount >= 100) {
      return showToast("Wrong Discount, try to add a correct one", "error");
    }

    const couponRegex = /^[A-Za-z0-9]{6,10}$/;
    if (!couponRegex.test(couponData.couponCode)) {
      return showToast(
        "Please enter a valid coupon code (6-10 alphanumeric characters, no spaces or special characters)",
        "error"
      );
    }
    const changes: Partial<typeof couponData> = {};

    if (couponData.couponName !== selectedCoupon.couponName) {
      changes.couponName = couponData.couponName;
    }

    if (couponData.couponCode !== selectedCoupon.couponCode) {
      changes.couponCode = couponData.couponCode;
    }

    if (couponData.couponDiscount !== selectedCoupon.couponDiscount) {
      changes.couponDiscount = couponData.couponDiscount;
    }

    if (
      couponData.expireAt !==
      new Date(selectedCoupon.expireAt).toISOString().substring(0, 16)
    ) {
      changes.expireAt = couponData.expireAt;
    }
    if (Object.keys(changes).length === 0) {
      return showToast("No changes made", "error");
    }
    updateCoupon(selectedCoupon?._id, changes)
      .then((data) => {
        setCoupons((prev) =>
          prev.map((c) =>
            c._id === selectedCoupon?._id ? { ...c, ...data.data } : c
          )
        );
        setEditModal(false);
        showToast("Coupon updated successfully", "success");
      })
      .catch((err) => {
        console.error("Failed to update coupon:", err);
        showToast("Failed to update coupon", "error");
      });
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setEditModal(true);

    // Format the date properly for the datetime-local input
    let formattedDate = "";
    if (coupon.expireAt) {
      const date = new Date(coupon.expireAt);
      // Ensure valid date before formatting
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().substring(0, 16);
      }
    }

    setCouponData({
      couponName: coupon.couponName || "",
      couponCode: coupon.couponCode || "",
      couponDiscount: coupon.couponDiscount || 0,
      expireAt: formattedDate,
    });
  };

  const indexOfLastCoupon = currentPage * itemsPerPage;
  const indexOfFirstCoupon = indexOfLastCoupon - itemsPerPage;
  const currentCoupons = coupons.slice(indexOfFirstCoupon, indexOfLastCoupon);

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 pt-10">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Coupon Management
          </h1>
          <div className="flex justify-between items-center">
            <p className="text-gray-400">Create and manage discount coupons</p>
            <button
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 px-5 py-2 rounded-lg text-white font-medium shadow-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={18} />
              Add Coupon
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : currentCoupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <Tag className="h-16 w-16 text-gray-500 mb-4" />
            <p className="text-xl font-semibold text-gray-300 mb-2">
              No Coupons Found
            </p>
            <p className="text-gray-400 text-center max-w-md">
              There are currently no coupons in the system. Click "Add Coupon"
              to create your first discount code.
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
                      Coupon Name
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Expiry
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentCoupons.map((coupon, index) => {
                    // Parse dates to ensure they're valid before formatting
                    const startDate = new Date(coupon.startDate);
                    const expiryDate = new Date(coupon.expireAt);
                    const isExpired = expiryDate < new Date();

                    return (
                      <tr
                        key={coupon._id}
                        className="border-b border-gray-700 hover:bg-gray-700/40 transition-all duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                          {indexOfFirstCoupon + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-white font-medium">
                          {coupon.couponName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-mono">
                            {coupon.couponCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300 font-medium">
                          {coupon.couponDiscount}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                          {!isNaN(startDate.getTime())
                            ? startDate.toLocaleDateString()
                            : "Invalid date"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                          {!isNaN(expiryDate.getTime())
                            ? expiryDate.toLocaleDateString()
                            : "Invalid date"}
                          {isExpired && !isNaN(expiryDate.getTime()) && (
                            <span className="ml-2 text-xs text-red-400">
                              (Expired)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {coupon.couponStatus ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">
                              <CheckCircle size={14} />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm">
                              <Archive size={14} />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
                              onClick={() => handleEditCoupon(coupon)}
                              title="Edit coupon"
                            >
                              <Edit size={16} />
                            </button>

                            {coupon.couponStatus ? (
                              <button
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                                onClick={() => handleToggleCoupon(coupon._id)}
                                title="Deactivate coupon"
                              >
                                <Archive size={16} />
                              </button>
                            ) : (
                              <button
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors"
                                onClick={() => handleToggleCoupon(coupon._id)}
                                title="Activate coupon"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {coupons.length > itemsPerPage && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(coupons.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Add Coupon Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 w-full max-w-md shadow-2xl transform transition-all">
            <form onSubmit={handleAddCoupon}>
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Add New Coupon
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Coupon Name
                  </label>
                  <input
                    className="w-full p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="e.g. Summer Sale"
                    value={couponData.couponName}
                    onChange={(e) =>
                      setCouponData({
                        ...couponData,
                        couponName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Coupon Code
                  </label>
                  <input
                    className="w-full p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:outline-none focus:border-purple-500 transition-colors font-mono"
                    placeholder="e.g. SUMMER20"
                    value={couponData.couponCode}
                    onChange={(e) =>
                      setCouponData({
                        ...couponData,
                        couponCode: e.target.value.toUpperCase(),
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    6-10 alphanumeric characters, no spaces or special symbols
                  </p>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Discount Percentage
                  </label>
                  <input
                    className="w-full p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                    type="number"
                    min="1"
                    max="99"
                    placeholder="e.g. 20"
                    value={couponData.couponDiscount || ""}
                    onChange={(e) =>
                      setCouponData({
                        ...couponData,
                        couponDiscount: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Expiry Date & Time
                  </label>
                  <input
                    className="w-full p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                    type="datetime-local"
                    value={
                      couponData.expireAt
                        ? couponData.expireAt.substring(0, 16)
                        : ""
                    }
                    onChange={(e) => {
                      setCouponData({
                        ...couponData,
                        expireAt: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  className="px-5 py-3 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 font-medium shadow-lg transition-all"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Coupon Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 w-full max-w-md shadow-2xl transform transition-all">
            <form onSubmit={handleUpdateCoupon}>
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Edit Coupon
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Coupon Name
                  </label>
                  <input
                    className="w-full p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="e.g. Summer Sale"
                    value={couponData.couponName}
                    onChange={(e) =>
                      setCouponData({
                        ...couponData,
                        couponName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Coupon Code
                  </label>
                  <input
                    className="w-full p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                    placeholder="e.g. SUMMER20"
                    value={couponData.couponCode}
                    onChange={(e) =>
                      setCouponData({
                        ...couponData,
                        couponCode: e.target.value.toUpperCase(),
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    6-10 alphanumeric characters, no spaces or special symbols
                  </p>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Discount Percentage
                  </label>
                  <input
                    className="w-full p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:outline-none focus:border-amber-500 transition-colors"
                    type="number"
                    min="1"
                    max="99"
                    placeholder="e.g. 20"
                    value={couponData.couponDiscount || ""}
                    onChange={(e) =>
                      setCouponData({
                        ...couponData,
                        couponDiscount: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Expiry Date & Time
                  </label>
                  <input
                    className="w-full p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:outline-none focus:border-amber-500 transition-colors"
                    type="datetime-local"
                    value={
                      couponData.expireAt
                        ? couponData.expireAt.substring(0, 16)
                        : ""
                    }
                    onChange={(e) => {
                      const selectedDateTime = new Date(e.target.value);
                      if (!isNaN(selectedDateTime.getTime())) {
                        const isoDateTime = selectedDateTime.toISOString();
                        setCouponData({ ...couponData, expireAt: isoDateTime });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  className="px-5 py-3 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                  onClick={() => setEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 font-medium shadow-lg transition-all"
                >
                  Update Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
