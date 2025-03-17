import { getCoupons } from "@/api/coupon/coupon";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const CouponList = () => {
  const { user } = useSelector((state: any) => state.auth);

  interface IUsedBy {
    userId: string;
    count: number;
  }

  interface ICoupon {
    couponName: string;
    couponCode: string;
    couponDiscount: number;
    startDate: Date;
    expireAt: Date;
    couponStatus: boolean;
    _id?: string;
    usedBy?: IUsedBy[];
  }

  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCoupons()
      .then((data) => {
        setCoupons(data.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user.user._id]);

  const availableCoupons = coupons.filter((coupon) => {
    const alreadyUsed = coupon.usedBy?.some(
      (entry) => entry.userId.toString() === user.user._id && entry.count >= 1
    );
    return !alreadyUsed;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-2">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="py-2">
      {availableCoupons.length > 0 ? (
        <div className="flex overflow-x-auto gap-2 snap-x">
          {availableCoupons.map((coupon) => (
            <div
              key={coupon._id}
              className="snap-start flex-shrink-0 bg-purple-600 text-white rounded-lg px-3 py-1 text-sm font-medium flex items-center shadow-sm hover:bg-purple-700 transition-colors cursor-pointer"
            >
              <span className="mr-2">{coupon.couponCode}</span>
              <span className="font-bold">{coupon.couponDiscount}%</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500">No coupons available</div>
      )}
    </div>
  );
};

export default CouponList;
