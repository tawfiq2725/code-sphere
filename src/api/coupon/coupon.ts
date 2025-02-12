import { backendUrl } from "@/utils/backendUrl";
import axios from "axios";
export const addCoupon = async (data: any, token: any) => {
  try {
    console.log("checking the data", data);
    const response = await axios.post(
      `${backendUrl}/api/course/create-coupon`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const getCoupons = async (token: any) => {
  try {
    const response = await axios.get(`${backendUrl}/api/course/get-coupons`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateCoupon = async (id: any, data: any, token: any) => {
  try {
    const response = await axios.patch(
      `${backendUrl}/api/course/update-coupon/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const toggleCoupon = async (couponId: string, token: any) => {
  try {
    const response = await axios.patch(
      `${backendUrl}/api/course/coupon/toggle/${couponId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.log(err);
  }
};
