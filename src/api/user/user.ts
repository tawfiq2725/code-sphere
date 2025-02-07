import { backendUrl } from "@/utils/backendUrl";
import axios from "axios";

export const getUserOrders = async (userId: string, token: any) => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/order/get-user-orders/${userId}`,
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

export const findUserById = async (userId: string) => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/user/find-user/${userId}`
    );
    return response.data;
  } catch (err) {
    console.log(err);
  }
};
