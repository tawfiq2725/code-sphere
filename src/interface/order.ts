export interface Orders {
  _id: string;
  orderId: string;
  userId: string;
  courseId: string;
  totalAmount: string;
  orderStatus: string;
  paymentStatus: string;
  isApplied: true;
  couponCode: string;
  couponDiscount: string;
  createdAt: string;
  updatedAt: string;
  __v: 0;
  razorpayOrderId: string;
  razorpayPaymentId: "pay_PxfHBtyrg1CLMU";
  razorpaySignature: string;
}
