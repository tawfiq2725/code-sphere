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
      `${backendUrl}/admin/toggle-membership-status/${id}`,
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
