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

export const getMemberships = async () => {
  try {
    const response = await axios.get(`${backendUrl}/get-memberships`);
    return response.data.data;
  } catch (err) {
    console.log(err);
  }
};

export const getMembershipById = async (membershipId: string, token: any) => {
  try {
    const response = await axios.get(
      `${backendUrl}/get-membership/${membershipId}`
    );
    return response.data.data;
  } catch (err) {
    console.log(err);
  }
};

export const getMembershipByUserId = async (id: any, token: any) => {
  try {
    const response = await axios.get(`${backendUrl}/get-membership/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (err) {
    console.log(err);
  }
};

export const getUserCertficates = async (userId: string, token: any) => {
  try {
    const response = await axios.get(
      `${backendUrl}/get-certifcates/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (err) {
    console.log(err);
  }
};
