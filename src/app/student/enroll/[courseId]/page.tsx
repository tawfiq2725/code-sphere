"use client";
import { getCoursById } from "@/api/course";
import { getAllCategories } from "@/api/category";
import { getOffers } from "@/api/user/user";
import { createOrder, verifyOrder } from "@/api/order/order";
import { showToast } from "@/utils/toastUtil";
import { AlertCircle, Shield, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import api from "@/api/axios";
import { couponApply, couponRemove } from "@/store/slice/orderSlice";
import { signedUrltoNormalUrl } from "@/utils/presignedUrl";
import { verifyCoupon } from "@/api/coupon/coupon";
import CouponList from "@/app/components/common/Coupons";
import { getUserDetails } from "@/store/slice/authSlice";

interface Course {
  courseName: string;
  courseDescription: string;
  thumbnail: string;
  courseId: string;
  sellingPrice: number;
  category: string;
  categoryName: string;
  offerPrice?: number;
  discountPercentage?: number;
  offerName?: string;
}

interface Category {
  _id: string;
  categoryName: string;
}

interface Offer {
  _id: string;
  offerName: string;
  discount: number;
  categoryId: {
    _id: string;
    categoryName: string;
    status: boolean;
  };
  startsFrom: string;
  endsFrom: string;
  status: boolean;
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const [courseData, setCourseData] = useState<Course>();
  const [processedCourse, setProcessedCourse] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const dispatch = useDispatch();

  const { user } = useSelector((state: any) => state.auth);
  const { couponApplied, totalAmount, discountAmount, couponUser } =
    useSelector((state: any) => state.order);
  if (courseData?.thumbnail) {
    let thumbnail = signedUrltoNormalUrl(courseData?.thumbnail);
    courseData.thumbnail = thumbnail;
  }

  // Fetch course, categories, and offers
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [courseResponse, categoriesResponse, offersResponse] =
          await Promise.all([
            getCoursById(courseId),
            getAllCategories(),
            getOffers(),
          ]);

        if (courseResponse && courseResponse.data) {
          setCourseData(courseResponse.data);
        }

        if (categoriesResponse) {
          setCategories(categoriesResponse);
        }

        if (offersResponse && offersResponse.data) {
          setOffers(offersResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  useEffect(() => {
    if (!courseData || !categories.length || !offers.length) return;
    const categoryId = courseData.categoryName || courseData.category;
    const category = categories.find((cat) => cat._id === categoryId);
    const activeOffers = offers.filter((offer) => offer.status === true);
    const matchingOffer = activeOffers.find(
      (offer) => offer.categoryId._id === categoryId
    );
    const processed = {
      ...courseData,
      actualCategoryName: category ? category.categoryName : "Unknown Category",
    };
    if (matchingOffer) {
      const offerDiscount = matchingOffer.discount;
      const discountAmount = (courseData.sellingPrice * offerDiscount) / 100;
      const discountedPrice = Math.floor(
        courseData.sellingPrice - discountAmount
      );

      processed.offerPrice = discountedPrice;
      processed.discountPercentage = offerDiscount;
      processed.offerName = matchingOffer.offerName;
    }

    setProcessedCourse(processed);
  }, [courseData, categories, offers]);
  useEffect(() => {
    if (user?.user?.courseProgress && courseId) {
      const isEnrolled = user.user.courseProgress.some(
        (course: any) => course.courseId === courseId
      );
      setIsAlreadyEnrolled(isEnrolled);
    }
  }, [user, courseId]);

  // Constants for tax and price calculations
  const taxRate = 0.18;
  const basePrice =
    processedCourse?.offerPrice || courseData?.sellingPrice || 0;
  const baseTax = Math.round(basePrice * taxRate * 100) / 100;
  const baseTotalAmount = basePrice + baseTax;
  const finalTotal = Math.round(
    couponApplied && couponUser === user?.user?._id
      ? discountAmount
      : baseTotalAmount
  );

  const [isChecked, setIsChecked] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      showToast("Please enter a coupon code", "error");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const result = await verifyCoupon(couponCode, courseId, user.user._id);

      if (result.couponStatus && result.couponDiscount) {
        const discountPercent = result.couponDiscount / 100;
        const discountValue = basePrice * discountPercent;
        const discountedPrice = basePrice - discountValue;
        const discountedTax = Math.round(discountedPrice * taxRate * 100) / 100;
        const newTotalAmount = discountedPrice + discountedTax;

        dispatch(
          couponApply({
            originalTotal: baseTotalAmount,
            newTotal: newTotalAmount,
            userId: user.user._id,
          })
        );

        setDiscount(discountPercent);
        setAppliedCoupon(couponCode);
        showToast(
          `Coupon applied successfully! ${result.couponDiscount}% off`,
          "success"
        );
      } else {
        setDiscount(0);
        setAppliedCoupon("");
        showToast(result.message || "Invalid coupon code", "error");
      }
    } catch (error) {
      console.log("Error applying coupon:", error);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleProceed = async () => {
    if (isAlreadyEnrolled) {
      router.push(`/student/profile/my-courses/${courseId}`);
      return;
    }

    if (!isChecked) {
      showToast("You must agree to the terms before proceeding.", "error");
      return;
    }

    const data = {
      currency: "INR",
      amount: finalTotal,
      userId: user.user._id,
      courseId: courseData?.courseId,
      isApplied: couponApplied && couponUser === user.user._id,
      couponCode: appliedCoupon ? appliedCoupon : null,
      couponDiscount: appliedCoupon ? discount : null,
      isOfferApplied: !!processedCourse?.offerPrice,
      offerName: processedCourse?.offerName || null,
      offerDiscount: processedCourse?.discountPercentage || null,
    };

    try {
      const order: any = await createOrder(data);
      if (!order) {
        console.log("error");
        return;
      }
      openRazorpay(order);
    } catch (error) {
      console.error(error);
    }
  };

  const navigateToCourse = () => {
    router.push(`/student/profile/my-courses/${courseId}`);
  };

  const details = {
    courseId: courseData?.courseId,
    userId: user?.user?._id,
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
        const verify = await verifyOrder(response, details);
        if (verify.success) {
          console.log(verify, verify.success, verify.data, verify.data.user);
          dispatch(couponRemove());
          if (verify.data.user.profile) {
            let url = signedUrltoNormalUrl(verify.data.user.profile);
            verify.data.user.profile = url;
          }
          dispatch(getUserDetails({ user: verify.data.user }));
          showToast("Payment Successful", "success");
          router.push("/student/confirmation-page");
        }
      },
      prefill: {
        name: user?.user?.name || "",
        email: user?.user?.email || "",
      },
      theme: {
        color: "#3399cc",
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  // Original price (before any discounts)
  const originalPrice = courseData?.sellingPrice || 0;
  const originalTax = Math.round(originalPrice * taxRate * 100) / 100;
  const originalTotalAmount = originalPrice + originalTax;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-8">
        {/* Already Enrolled Alert */}
        {isAlreadyEnrolled && (
          <div className="md:col-span-5 bg-purple-900/30 border border-purple-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-purple-300">
                You're already enrolled in this course!
              </h3>
              <p className="text-sm text-purple-300/80 mt-1">
                You have already purchased this course. Continue learning or
                explore your other courses.
              </p>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={navigateToCourse}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  Continue Learning
                </button>
                <button
                  onClick={() => router.push("/student/profile/my-profile")}
                  className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="md:col-span-3 space-y-6">
          <h1 className="text-2xl font-semibold">Billing Details</h1>

          <div className="space-y-5">
            {/* User Email */}
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Get Started</label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.user?.email || ""}
                  disabled
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-purple-500 transition-all disabled:opacity-75"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-green-500 font-medium">
                  Logged
                </span>
              </div>
            </div>

            {/* Payment Information */}
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

            {/* Coupon Code Section */}
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">
                Have a coupon? (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-600"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={
                    (couponApplied && couponUser === user?.user?._id) ||
                    isAlreadyEnrolled
                  }
                  className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg px-4 py-2.5 flex items-center gap-2 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Tag className="w-4 h-4" />
                  {isApplyingCoupon ? "Applying..." : "Apply"}
                </button>
                {couponApplied && couponUser === user?.user?._id && (
                  <button
                    className="text-sm text-red-500"
                    onClick={() => {
                      dispatch(couponRemove());
                      setDiscount(0);
                      setAppliedCoupon("");
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <CouponList />
            {/* Terms & Conditions */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => setIsChecked(!isChecked)}
                disabled={isAlreadyEnrolled}
                className="mt-1 rounded border-gray-700 bg-gray-900/50 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 disabled:opacity-50"
              />
              <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                By completing this purchase, you agree to Code Sphere Privacy &
                Terms, and Teachable's Privacy & Terms.
              </span>
            </label>

            {/* Proceed / Pay Now Button */}
            <button
              onClick={handleProceed}
              className={`w-full ${
                isAlreadyEnrolled
                  ? "bg-purple-700 hover:bg-purple-800"
                  : "bg-purple-600 hover:bg-purple-700"
              } text-white rounded-lg px-6 py-2.5 flex items-center justify-center gap-2 transition-colors`}
            >
              {isAlreadyEnrolled ? (
                <>Continue to Course</>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Pay Now (₹{Math.round(finalTotal)})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Order Summary */}
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

              {/* Offer badge if available */}
              {processedCourse?.discountPercentage && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  {processedCourse.discountPercentage}% OFF
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-1">{courseData?.courseName}</h3>
              <p className="text-sm text-gray-400 mb-2">
                {courseData?.courseDescription}
              </p>

              {/* Show price with offer if available */}
              {processedCourse?.offerPrice ? (
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-semibold">
                    ₹{processedCourse.offerPrice}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ₹{originalPrice}
                  </span>
                  <span className="text-xs text-green-400">
                    {processedCourse.offerName ||
                      `${processedCourse.discountPercentage}% OFF`}
                  </span>
                </div>
              ) : (
                <div className="text-2xl font-semibold">₹{originalPrice}</div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Estimated Tax</span>
                <span>₹{baseTax}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Miscellaneous Tax</span>
                <span>₹0</span>
              </div>

              {/* If offer is applied, show the offer details */}
              {processedCourse?.offerPrice && (
                <div className="flex justify-between items-center text-sm text-green-500">
                  <span>Offer Discount</span>
                  <span>-₹{originalPrice - processedCourse.offerPrice}</span>
                </div>
              )}

              {/* If coupon is applied, show the coupon details */}
              {couponApplied && couponUser === user?.user?._id && (
                <div className="flex justify-between items-center text-sm text-green-500">
                  <span>Coupon Discount</span>
                  <span>-₹{baseTotalAmount - discountAmount}</span>
                </div>
              )}

              {isAlreadyEnrolled && (
                <div className="flex justify-between items-center text-sm text-green-500 pt-3 border-t border-gray-800">
                  <span>Status</span>
                  <span>Already Enrolled</span>
                </div>
              )}

              <div className="flex justify-between items-center text-base font-medium pt-3 border-t border-gray-800">
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
