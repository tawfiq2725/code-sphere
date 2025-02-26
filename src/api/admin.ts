import api from "@/api/axios";

export const fetchMemberships = async () => {
  try {
    const response = await api.get("/admin/get-memberships");
    return response.data.data;
  } catch (error: any) {
    console.log("Failed to fetch memberships:", error);
  }
};

export const addMembership = async (data: any) => {
  try {
    const response = await api.post("/admin/add-membership", data);

    return response.data.data;
  } catch (error: any) {
    console.log("Failed to add membership:", error);
  }
};

export const updateMembership = async (id: any, data: any) => {
  try {
    const response = await api.patch(`/admin/edit-membership/${id}`, data);
    console.log("Membership updated successfully:", response.data.data);
    return response.data.data;
  } catch (error: any) {
    console.log("Failed to update membership:", error);
  }
};

export const toggleStatusMembership = async (id: any) => {
  try {
    const response = await api.patch(`/admin/toggle-membership/${id}`);
    console.log("Membership status toggled successfully:", response.data.data);
    return response.data.data;
  } catch (error: any) {
    console.log("Failed to toggle membership status:", error);
  }
};

export const getMembershipOrders = async (token: any) => {
  try {
    const response = await api.get("/admin/get-memberships/orders");
    return response.data.data;
  } catch (error: any) {
    console.log("Failed to fetch membership orders:", error);
  }
};

export const getMembershipOrderById = async (id: string) => {
  try {
    const response = await api.get(`/admin/get-memberships/orders/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.log("Failed to fetch membership order details:", error);
  }
};

export const getOrderById = async (id: string) => {
  try {
    const response = await api.get(`/api/order/get-all-orders/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.log("Failed to fetch order details:", error);
  }
};

export const dashboardData = async () => {
  try {
    const { data } = await api.get("/api/reports/admin/dashboard");
    return data.data;
  } catch (error: any) {
    console.log("Failed to fetch dashboard data:", error);
  }
};
