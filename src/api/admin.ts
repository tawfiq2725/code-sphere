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
    return response.data.data;
  } catch (error: any) {
    console.log("Failed to update membership:", error);
  }
};

export const toggleStatusMembership = async (id: any) => {
  try {
    const response = await api.patch(`/admin/toggle-membership/${id}`);
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

export const fetchOffers = async () => {
  try {
    const response = await api.get("/get-offers");
    return response.data.data;
  } catch (error: any) {
    console.log("Failed to fetch offers:", error);
  }
};

export const fetchUsersByAdmin = async (params: any) => {
  try {
    const response = await api.get(`/admin/get-users?`, { params });
    const data = await response.data;
    return data;
  } catch (err) {
    console.log(err);
  }
};
