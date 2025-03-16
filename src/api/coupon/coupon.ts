import api from "@/api/axios";
export const addCoupon = async (data: any) => {
  try {
    const response = await api.post(`/api/course/create-coupon`, data);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const getCoupons = async () => {
  try {
    const response = await api.get(`/api/course/get-coupons`);

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateCoupon = async (id: any, data: any) => {
  try {
    const response = await api.patch(`/api/course/update-coupon/${id}`, data);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const toggleCoupon = async (couponId: string) => {
  try {
    const response = await api.patch(`/api/course/coupon/toggle/${couponId}`);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const deleteCoupon = async (couponId: string) => {
  try {
    const response = await api.delete(`/api/course/coupon/delete/${couponId}`);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const verifyCoupon = async (
  code: string,
  courseId: string,
  userId: string
) => {
  try {
    const response = await api.post(`/api/verify-coupon`, {
      couponCode: code,
      courseId,
      userId,
    });
    const data = await response.data;
    return data.data;
  } catch (error) {
    console.log("Error verifying coupon:", error);
  }
};
