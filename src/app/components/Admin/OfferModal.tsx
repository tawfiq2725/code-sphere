"use client";

import { useEffect, useState } from "react";
import { X, Calendar } from "lucide-react";
import api from "@/api/axios";
import { showToast } from "@/utils/toastUtil";

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer?: any;
  onSuccess: () => void;
}

const OfferModal = ({
  isOpen,
  onClose,
  offer = null,
  onSuccess,
}: OfferModalProps) => {
  interface Category {
    _id: string;
    categoryName: string;
    status: boolean;
  }

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    offerName: "",
    categoryId: "",
    discount: 0,
    startsFrom: "",
    endsFrom: "",
    status: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchCategories();

      // If editing an existing offer, populate the form
      if (offer) {
        setFormData({
          offerName: offer.offerName,
          categoryId: offer.categoryId._id,
          discount: offer.discount,
          startsFrom: new Date(offer.startsFrom).toISOString().split("T")[0],
          endsFrom: new Date(offer.endsFrom).toISOString().split("T")[0],
          status: offer.status,
        });
      } else {
        // Reset form for new offer
        setFormData({
          offerName: "",
          categoryId: "",
          discount: 0,
          startsFrom: "",
          endsFrom: "",
          status: true,
        });
      }
      // Clear errors when modal opens/reopens
      setErrors({});
    }
  }, [isOpen, offer]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/admin/get-categories");
      const data = await response.data;

      if (data.success) {
        setCategories(data.data);

        if (!offer && data.data.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({
            ...prev,
            categoryId: data.data[0]._id,
          }));
        }
      } else {
        showToast("Failed to fetch categories", "error");
      }
    } catch (err) {
      showToast("Error fetching categories", "error");
      console.error(err);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "discount" ? Number(value) : value,
    }));

    // Clear error for this field when user changes it
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate offer name (allow letters, spaces, commas, and periods)
    if (!formData.offerName.trim()) {
      newErrors.offerName = "Offer name is required";
    } else if (!/^[a-zA-Z\s,.]+$/.test(formData.offerName)) {
      newErrors.offerName =
        "Offer name can only contain letters, spaces, commas, and periods";
    }

    // Validate discount (between 1 and 30)
    if (formData.discount < 1 || formData.discount > 30) {
      newErrors.discount = "Discount must be between 1% and 30%";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Please select a category";
    }

    if (!formData.startsFrom) {
      newErrors.startsFrom = "Start date is required";
    } else {
      const startDate = new Date(formData.startsFrom);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        newErrors.startsFrom = "Start date cannot be in the past";
      }
    }

    // Validate end date
    if (!formData.endsFrom) {
      newErrors.endsFrom = "End date is required";
    } else if (formData.startsFrom) {
      const startDate = new Date(formData.startsFrom);
      const endDate = new Date(formData.endsFrom);

      if (endDate <= startDate) {
        newErrors.endsFrom = "End date must be after start date";
      }

      // Check if offer duration is reasonable (optional, adjust as needed)
      const maxDuration = 90; // 90 days maximum
      const daysDifference = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDifference > maxDuration) {
        newErrors.endsFrom = `Offer cannot exceed ${maxDuration} days`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      showToast("Please fix the errors in the form", "error");
      return;
    }

    setIsLoading(true);

    try {
      let response;

      if (offer) {
        response = await api.put(`/admin/update-offer/${offer._id}`, formData);
      } else {
        response = await api.post("/admin/create-offer", formData);
      }

      const data = await response.data;

      if (data.success) {
        showToast(
          `Offer ${offer ? "updated" : "created"} successfully`,
          "success"
        );
        onSuccess();
        onClose();
      } else {
        showToast(data.message || "Operation failed", "error");
      }
    } catch (err: any) {
      console.error(err);
      showToast(
        err.response?.data?.message ||
          "An error occurred while saving the offer",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative bg-gray-800 rounded-xl border border-gray-700 shadow-2xl p-6 w-full max-w-lg mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          {offer ? "Edit Offer" : "Create New Offer"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label
                htmlFor="offerName"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Offer Name
              </label>
              <input
                type="text"
                id="offerName"
                name="offerName"
                value={formData.offerName}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 bg-gray-700 border ${
                  errors.offerName ? "border-red-500" : "border-gray-600"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white`}
                placeholder="e.g., Summer Sale"
              />
              {errors.offerName && (
                <p className="mt-1 text-sm text-red-500">{errors.offerName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="categoryId"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 bg-gray-700 border ${
                  errors.categoryId ? "border-red-500" : "border-gray-600"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white`}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="discount"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Discount Percentage (1-30%)
              </label>
              <input
                type="number"
                id="discount"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-gray-700 border ${
                  errors.discount ? "border-red-500" : "border-gray-600"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white`}
                placeholder="e.g., 10"
              />
              {errors.discount && (
                <p className="mt-1 text-sm text-red-500">{errors.discount}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startsFrom"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="startsFrom"
                    name="startsFrom"
                    value={formData.startsFrom}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 bg-gray-700 border ${
                      errors.startsFrom ? "border-red-500" : "border-gray-600"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white`}
                  />
                  <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.startsFrom && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.startsFrom}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="endsFrom"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="endsFrom"
                    name="endsFrom"
                    value={formData.endsFrom}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 bg-gray-700 border ${
                      errors.endsFrom ? "border-red-500" : "border-gray-600"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white`}
                  />
                  <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.endsFrom && (
                  <p className="mt-1 text-sm text-red-500">{errors.endsFrom}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="mr-3 px-4 py-2 rounded-lg font-medium transition duration-300 bg-gray-700 hover:bg-gray-600 text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg font-medium transition duration-300 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white flex items-center"
            >
              {isLoading ? (
                <>
                  <span className="mr-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </span>
                  Processing...
                </>
              ) : offer ? (
                "Update Offer"
              ) : (
                "Create Offer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferModal;
