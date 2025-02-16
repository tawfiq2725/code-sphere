export interface Memberships {
  _id: string;
  membershipId: string;
  membershipName: string;
  membershipDescription: string[];
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
  categoryId: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  membershipStartDate: string;
  membershipEndDate: string;
  membershipStatus: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
