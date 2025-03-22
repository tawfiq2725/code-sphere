import api from "@/api/axios";

export const signIn = async () => {};

export const getUserOrders = async (userId: string) => {
  try {
    const response = await api.get(`/api/order/get-user-orders/${userId}`);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const findUserById = async (userId: string) => {
  try {
    const response = await api.get(`/api/user/find-user/${userId}`);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};
export const findUserByIdA = async (userId: string) => {
  try {
    const response = await api.get(`/admin/api/user/find-user/${userId}`);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const getMemberships = async () => {
  try {
    const response = await api.get("/get-memberships");
    return response.data.data;
  } catch (err) {
    console.log(err);
  }
};

export const getMembershipById = async (membershipId: string) => {
  try {
    const response = await api.get(`/get-membership/${membershipId}`);
    return response.data.data;
  } catch (err) {
    console.log(err);
  }
};

export const getMembershipByUserId = async (id: any) => {
  try {
    const response = await api.get(`/get-membership/${id}`);
    return response.data.data;
  } catch (err) {
    console.log(err);
  }
};
export const getMembershipByUserOId = async (id: any) => {
  try {
    const response = await api.get(`/get-membership/order/${id}`);
    return response.data.data;
  } catch (err) {
    console.log(err);
  }
};

export const getUserCertficates = async (userId: string) => {
  try {
    const response = await api.get(`/get-certifcates/${userId}`);
    return response.data.data;
  } catch (err) {
    console.log(err);
  }
};

export const getOffers = async () => {
  try {
    const response = await api.get("/api/offers");
    return response.data.data;
  } catch (err) {
    console.log(err);
  }
};

export const getOrderReview = async (orderId: string) => {
  try {
    const response = await api.get(`/api/course/get/review/${orderId}`);
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching review:", error);
    throw error;
  }
};

export const addOrderReview = async (
  orderId: string,
  reviewData: { rating: number; description: string }
) => {
  try {
    const response = await api.patch(
      `/api/course/review/${orderId}`,
      reviewData
    );

    const data = await response.data;
    return data;
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
};

export const getRecentMessage = async (id: string) => {
  try {
    const response = await api.get(`/students/get-recent/${id}`);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};
