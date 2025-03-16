"use client";

import { getMembershipById, getMemberships } from "@/api/user/user";
import { getAllCategories, getAllCategoriesUser } from "@/api/category";
import { membershipOrder, verifyMembershipOrder } from "@/api/order/order";
import { showToast } from "@/utils/toastUtil";
import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface Membership {
  _id: string;
  membershipId: string;
  membershipName: string;
  membershipDescription: string;
  membershipPlan: "Basic" | "Standard" | "Premium";
  price: number;
  label: string;
  status: boolean;
}

interface Category {
  _id: string;
  categoryName: string;
}

export default function MembershipCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const [selectedMembership, setSelectedMembership] =
    useState<Membership | null>(null);
  // selectedCategory is either a string (for non-Premium plans) or string[] (for Premium)
  const [selectedCategory, setSelectedCategory] = useState<string | string[]>(
    []
  );
  const { user } = useSelector((state: any) => state.auth);
  const userMembershipCategoryIds = user.user.membership?.categoryId || [];
  let membershipPrice = Number(localStorage.getItem("membershipId")) || 0;
  let membershipName = localStorage.getItem("membershipName") || "";

  useEffect(() => {
    if (selectedMembership) {
      if (selectedMembership.membershipPlan === "Premium") {
        setSelectedCategory([]);
      } else {
        setSelectedCategory("");
      }
    }
  }, [selectedMembership]);

  useEffect(() => {
    getMemberships()
      .then((data) => {
        setMemberships(data);
        if (data.length > 0) {
          setSelectedMembership(data[0]);
        }
      })
      .catch((err) => {
        console.error("Error fetching memberships:", err);
      });
    getMembershipById(id)
      .then((data) => {
        setSelectedMembership(data);
        membershipPrice += data.price;
        membershipName = data.membershipName;
      })
      .catch((err) => {
        console.error("Error fetching membership:", err);
      });

    getAllCategoriesUser(user.user._id)
      .then((data) => {
        const filteredCategories = data.filter(
          (category: Category) =>
            !userMembershipCategoryIds.includes(category._id)
        );
        setCategories(filteredCategories);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  }, []);

  const taxRate = 0.18;
  const estimatedTax = Math.round(membershipPrice * taxRate * 100) / 100;
  const totalAmount = membershipPrice + estimatedTax;

  const [isChecked, setIsChecked] = useState(false);

  const dataForOrder = {
    currency: "INR",
    amount: totalAmount,
    userId: user.user._id,
    membershipId: selectedMembership?._id,
    categoryId: selectedCategory,
    membershipPlan: selectedMembership?.membershipPlan,
  };

  const handleProceed = async () => {
    if (!isChecked) {
      showToast("You must agree to the terms before proceeding.", "error");
      return;
    }

    if (
      (typeof selectedCategory === "string" && !selectedCategory) ||
      (Array.isArray(selectedCategory) && selectedCategory.length === 0)
    ) {
      showToast("Please select a category.", "error");
      return;
    }
    try {
      const order: any = await membershipOrder(dataForOrder);
      if (!order) {
        showToast("Failed to create order. Try again.", "error");
        return;
      }

      openRazorpay(order);
    } catch (error) {
      console.error(error);
    }
  };

  const details = {
    membershipId: selectedMembership?._id,
    userId: user.user._id,
    categoryId: selectedCategory,
  };

  const openRazorpay = (orderData: any) => {
    interface RazorpayOptions {
      key_id: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      handler: (response: any) => void;
      prefill: {
        name: string;
        email: string;
      };
      theme: {
        color: string;
      };
    }

    const options: RazorpayOptions = {
      key_id: "rzp_test_NUlntIlFuC9puI",
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Code Sphere",
      description: `Payment for ${membershipName}`,
      order_id: orderData.id,
      handler: async function (response: any) {
        const verify = await verifyMembershipOrder(response, details);
        if (verify.success) {
          localStorage.removeItem("membershipId");
          localStorage.removeItem("membershipName");

          // Reset states if needed
          setSelectedCategory(
            selectedMembership?.membershipPlan === "Premium" ? [] : ""
          );
          setIsChecked(false);

          showToast("Payment Successful", "success");
          router.push("/student/confirmation-page");
        }
      },
      prefill: {
        name: user.user.name,
        email: user.user.email,
      },
      theme: {
        color: "#3399cc",
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Handler for multi-select dropdown (for Premium plan)
  const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    if (selectedOptions.length <= 3) {
      setSelectedCategory(selectedOptions);
    } else {
      showToast("You can select only 3 categories", "error");

      // Keep only the first 3 selections
      setSelectedCategory(selectedOptions.slice(0, 3));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-6">
          <h1 className="text-2xl font-semibold">Membership Checkout</h1>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={user.user.email}
                  disabled
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-purple-500 transition-all disabled:opacity-75"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-green-500 font-medium">
                  Logged
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Choose Category</label>
              {selectedMembership?.membershipPlan === "Premium" ? (
                <select
                  multiple
                  value={
                    Array.isArray(selectedCategory) ? selectedCategory : []
                  }
                  onChange={handleMultiSelect}
                  className="w-full bg-black text-white border border-gray-800 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-purple-500 transition-all appearance-none"
                >
                  {categories.map((category) => (
                    <option
                      key={category._id}
                      value={category._id}
                      className="bg-black hover:bg-purple-500"
                    >
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={
                    typeof selectedCategory === "string" ? selectedCategory : ""
                  }
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-black text-white border border-gray-800 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-purple-500 transition-all appearance-none"
                >
                  <option
                    value=""
                    className="bg-black hover:bg-purple-500 text-gray-400"
                  >
                    Select a category
                  </option>
                  {categories.map((category) => (
                    <option
                      key={category._id}
                      value={category._id}
                      className="bg-black hover:bg-purple-500"
                    >
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">
                Payment information
              </label>
              <div className="relative">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <Shield className="w-4 h-4" />
                  <span>All transactions are secure and encrypted.</span>
                </div>
                <button className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-2.5 text-left hover:border-gray-700 transition-colors">
                  Razorpay
                </button>
              </div>
            </div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => setIsChecked(!isChecked)}
                className="mt-1 rounded border-gray-700 bg-gray-900/50 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
              />
              <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                By completing this purchase, you agree to Code Sphere Privacy &
                Terms, and Teachable's Privacy & Terms.
              </span>
            </label>
            <button
              onClick={handleProceed}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-6 py-2.5 flex items-center justify-center gap-2 transition-colors"
            >
              <Shield className="w-4 h-4" />
              Pay Now
            </button>
          </div>
        </div>

        <div className="md:col-span-2 h-fit bg-gray-900/50 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4">Membership Summary</h2>

          <div className="space-y-4">
            <div className="aspect-[4/3] bg-gray-900/50 rounded-lg overflow-hidden relative group">
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={"/membership.png"}
                  alt={"Membership Thumbnail"}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            <div>
              <h3 className="font-medium mb-1">
                {selectedMembership?.membershipName}
              </h3>
              <p className="text-sm text-gray-400 mb-2">
                {selectedMembership?.membershipDescription}
              </p>
              <div className="text-2xl font-semibold">₹{membershipPrice}</div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Estimated Tax</span>
                <span>₹{estimatedTax}</span>
              </div>
              <div className="flex justify-between items-center text-base font-medium pt-3 border-t border-gray-800">
                <span>Total</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
