"use client";
import { getCoursById } from "@/api/course";
import { createOrder, verifyOrder } from "@/api/order/order";
import { showToast } from "@/utils/toastUtil";
import { Shield, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
interface Course {
  courseName: string;
  courseDescription: string;
  thumbnail: string;
  courseId: string;
  sellingPrice: number;
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const [courseData, setCourseData] = useState<Course>();
  const router = useRouter();
  useEffect(() => {
    getCoursById(courseId).then((data) => {
      setCourseData(data.data);
    });
  }, [courseId]);

  const { user } = useSelector((state: any) => state.auth);

  //   calculate the estimated tax
  const taxRate = 0.18;
  const estimatedTax =
    Math.round((courseData?.sellingPrice ?? 0) * taxRate * 100) / 100;
  const totalAmount = (courseData?.sellingPrice ?? 0) + estimatedTax;

  const [isChecked, setIsChecked] = useState(false);

  const token = Cookies.get("jwt_token");
  const handleProceed = async () => {
    if (!isChecked) {
      showToast("You must agree to the terms before proceeding.", "error");
      return;
    }
    const data = {
      currency: "INR",
      amount: totalAmount,
      userId: user.user._id,
      courseId: courseData?.courseId,
    };
    try {
      const order: any = await createOrder(data, token);
      if (!order) {
        showToast("Failed to create order. Try again.", "error");
        return;
      }
      console.log("Order Data:", order);
      openRazorpay(order);
    } catch (error) {
      console.error(error);
    }
  };
  console.log();
  const details = {
    courseId: courseData?.courseId,
    userId: user.user._id,
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
      description: `Payment for ${courseData?.courseName}`,
      order_id: orderData.id,
      handler: async function (response: any) {
        alert("Payment Successful!");
        console.log("Payment Response:", response);
        const verify = await verifyOrder(response, details, token);
        console.log("Verify Response:", verify);
        if (verify.success) {
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

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-6">
          <h1 className="text-2xl font-semibold">Billing Details</h1>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Get Started</label>
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

            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">
                Have a coupon? (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  className="flex-1 bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-600"
                />
                <button className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg px-4 py-2.5 flex items-center gap-2 transition-colors whitespace-nowrap">
                  <Tag className="w-4 h-4" />
                  Apply
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
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

          <div className="space-y-4">
            <div className="aspect-[4/3] bg-gray-900/50 rounded-lg overflow-hidden relative group">
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={courseData?.thumbnail}
                  alt={courseData?.courseName || "Course Thumbnail"}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>

            <div>
              <h3 className="font-medium mb-1">{courseData?.courseName}</h3>
              <p className="text-sm text-gray-400 mb-2">
                {courseData?.courseDescription}
              </p>
              <div className="text-2xl font-semibold">
                ₹{courseData?.sellingPrice}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Estimated Tax</span>
                <span>₹{estimatedTax}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Miscellaneous Tax</span>
                <span>₹0</span>
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
