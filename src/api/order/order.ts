import { backendUrl } from "@/utils/backendUrl";
import axios from "axios";
import api from "@/api/axios";

export const createOrder = async (data: any, token: any) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/order/create-order`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response.data);
    localStorage.setItem("orderId", response.data.data.orderId);
    return response.data.data.order;
  } catch (err) {
    console.log(err);
  }
};

export const verifyOrder = async (
  data: any,
  courseDetails: any,
  token: any
) => {
  try {
    const orderId = localStorage.getItem("orderId");
    const response = await axios.post(
      `${backendUrl}/api/order/verify-order`,
      {
        data,
        orderId,
        courseDetails,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("safaana id", response.data);
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

export const membershipOrder = async (data: any, token: any) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/order/membership/create-order`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    localStorage.setItem("orderId", response.data.data.orderId);
    return response.data.data.order;
  } catch (err) {
    console.log(err);
  }
};

export const verifyMembershipOrder = async (
  data: any,
  courseDetails: any,
  token: any
) => {
  try {
    const orderId = localStorage.getItem("orderId");
    const response = await axios.post(
      `${backendUrl}/api/order/membership/verify-order`,
      {
        data,
        orderId,
        courseDetails,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.log(err);
  }
};
