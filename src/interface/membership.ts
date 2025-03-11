export interface Memberships {
  _id: string;
  membershipId: string;
  membershipName: string;
  membershipDescription: string;
  membershiPlan: "Basic" | "Standard" | "Premium";
  price: number;
  label: string;
  originalPrice: number;
  status: boolean;
}

export interface MembershipOrder {
  _id: string;
  membershipOrderId: string;
  membershipId: string;
  userId: string;
  categoryId: string[];
  membershipPlan: "Basic" | "Standard" | "Premium";
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
