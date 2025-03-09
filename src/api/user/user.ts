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
    console.log(response.data.data);
    return response.data.data;
  } catch (err) {
    console.log(err);
  }
};
