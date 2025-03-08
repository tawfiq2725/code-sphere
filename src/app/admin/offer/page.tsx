"use client";

import { useEffect, useState } from "react";
import { showToast } from "@/utils/toastUtil";
import Pagination from "@/app/components/common/pagination";
import Search from "@/app/components/common/search";
import type { IPagination } from "@/interface/pagination";
import {
  Tag,
  Edit,
  Trash2,
  PlusCircle,
  Clock,
  Check,
  X,
  PercentCircle,
  Calendar,
} from "lucide-react";
import api from "@/api/axios";
import Image from "next/image";
import OfferModal from "@/app/components/Admin/OfferModal"; // Import the new component

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const OfferManagement = () => {
  interface Category {
    _id: string;
    categoryName: string;
    status: boolean;
  }
  interface Offer {
    _id: string;
    offerName: string;
    categoryId: Category;
    discount: number;
    startsFrom: string;
    endsFrom: string;
    status: boolean;
  }

  const [offers, setOffers] = useState<Offer[]>([]);
  const [pagination, setPagination] = useState<IPagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const offersPerPage = 5;
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: offersPerPage.toString(),
        search: debouncedSearchTerm,
      });
      const response = await api.get(`/admin/get-offers`, { params });

      const data = await response.data;
      if (!data.success) {
        showToast(data.message, "error");
      } else {
        setOffers(data.data.data);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      showToast("Failed to fetch offers", "error");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [currentPage, debouncedSearchTerm]);

  const toggleOfferStatus = async (offerId: string, currentStatus: boolean) => {
    try {
      const endpoint = `/admin/toggle-offer/${offerId}`;

      const response = await api.patch(endpoint);
      const data = await response.data;

      if (data.success) {
        setOffers((prevOffers) =>
          prevOffers.map((offer) =>
            offer._id === offerId ? { ...offer, status: !currentStatus } : offer
          )
        );
        showToast(
          `Offer ${currentStatus ? "deactivated" : "activated"} successfully`,
          "success"
        );
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast(
        `Failed to ${currentStatus ? "deactivate" : "activate"} offer`,
        "error"
      );
      console.error(err);
    }
  };

  const handleEditOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);
  };

  const handleAddOffer = () => {
    setSelectedOffer(null);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchOffers();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 pt-10">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Offer Management
          </h1>
          <p className="text-gray-400">
            Create and manage promotional offers for courses
          </p>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-6 gap-4">
            <div className="w-full max-w-md">
              <Search searchTerm={searchTerm} onSearch={setSearchTerm} />
            </div>
            <button
              className="inline-flex items-center px-4 py-2 rounded-lg font-medium transition duration-300 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              onClick={handleAddOffer}
            >
              <PlusCircle size={16} className="mr-2" />
              Create New Offer
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : offers.length > 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700/70 text-gray-300 text-sm uppercase">
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      S.No
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Offer Title
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Duration
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
                  {offers.map((offer, index) => (
                    <tr
                      key={offer._id}
                      className="border-b border-gray-700 hover:bg-gray-700/40 transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                        {offer.categoryId.categoryName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white font-medium">
                        {offer.offerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-medium">
                          <PercentCircle size={14} />
                          {offer.discount}% Off
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(offer.startsFrom)}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(offer.endsFrom)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {offer.status ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">
                            <Check size={14} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm">
                            <X size={14} />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            className="p-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-all duration-200"
                            title="Edit Offer"
                            onClick={() => handleEditOffer(offer)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              offer.status
                                ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/20"
                                : "text-green-400 hover:text-green-300 hover:bg-green-500/20"
                            }`}
                            onClick={() =>
                              toggleOfferStatus(offer._id, offer.status)
                            }
                            title={
                              offer.status
                                ? "Deactivate Offer"
                                : "Activate Offer"
                            }
                          >
                            {offer.status ? (
                              <Clock size={16} />
                            ) : (
                              <Check size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 px-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <Tag className="h-16 w-16 text-gray-500 mb-4" />
            <p className="text-xl font-semibold text-gray-300 mb-2">
              No Offers Found
            </p>
            <p className="text-gray-400 text-center max-w-md">
              There are currently no promotional offers matching your search
              criteria.
            </p>
          </div>
        )}

        {pagination && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Offer Modal */}
      <OfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        offer={selectedOffer}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default OfferManagement;
