import { backendUrl } from "@/utils/backendUrl";
import axios from "axios";

export const fetchMemberships = async (token: any) => {
  try {
    const response = await axios.get(`${backendUrl}/admin/get-memberships`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Memberships fetched successfully:", response.data.data);
    return response.data.data;
  } catch (error: any) {
    console.log("Failed to fetch memberships:", error);
  }
};

export const addMembership = async (token: any, data: any) => {
  try {
    const response = await axios.post(
      `${backendUrl}/admin/add-membership`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Membership added successfully:", response.data.data);
    return response.data.data;
  } catch (error: any) {
    console.log("Failed to add membership:", error);
  }
};

export const updateMembership = async (token: any, id: any, data: any) => {
  try {
    const response = await axios.patch(
      `${backendUrl}/admin/edit-membership/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Membership updated successfully:", response.data.data);
    return response.data.data;
  } catch (error: any) {
    console.log("Failed to update membership:", error);
  }
};

export const toggleStatusMembership = async (token: any, id: any) => {
  try {
    const response = await axios.patch(
      `${backendUrl}/admin/toggle-membership/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Membership status toggled successfully:", response.data.data);
    return response.data.data;
  } catch (error: any) {
    console.log("Failed to toggle membership status:", error);
  }
};

export const getMembershipOrders = async (token: any) => {
  try {
    const response = await axios.get(
      `${backendUrl}/admin/get-memberships/orders`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error: any) {
    console.log("Failed to fetch membership orders:", error);
  }
};

export const getMembershipOrderById = async (token: string, id: string) => {
  try {
    const response = await axios.get(
      `${backendUrl}/admin/get-memberships/orders/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error: any) {
    console.log("Failed to fetch membership order details:", error);
  }
};

export const getOrderById = async (token: string, id: string) => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/order/get-all-orders/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error: any) {
    console.log("Failed to fetch order details:", error);
  }
};

export const dashboardData = async (token: string) => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/reports/admin/dashboard`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error: any) {
    console.log("Failed to fetch dashboard data:", error);
  }
};
