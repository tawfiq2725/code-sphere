import api from "@/api/axios";

export const createOrder = async (data: any) => {
  try {
    const response = await api.post(`/api/order/create-order`, data);

    localStorage.setItem("orderId", response.data.data.orderId);
    return response.data.data.order;
  } catch (err) {
    console.log(err);
  }
};

export const verifyOrder = async (data: any, courseDetails: any) => {
  try {
    const orderId = localStorage.getItem("orderId");
    const response = await api.post("/api/order/verify-order", {
      data,
      orderId,
      courseDetails,
    });
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const getAllorders = async () => {
  try {
    const response = await api.get("/api/order/get-all-orders");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const membershipOrder = async (data: any) => {
  try {
    const response = await api.post("/api/order/membership/create-order", data);
    localStorage.setItem("orderId", response.data.data.orderId);
    return response.data.data.order;
  } catch (err) {
    console.log(err);
  }
};

export const verifyMembershipOrder = async (data: any, courseDetails: any) => {
  try {
    const orderId = localStorage.getItem("orderId");
    const response = await api.post("/api/order/membership/verify-order", {
      data,
      orderId,
      courseDetails,
    });
    return response.data;
  } catch (err) {
    console.log(err);
  }
};
