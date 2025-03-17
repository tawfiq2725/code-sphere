import api from "@/api/axios";

export const logoutUser = async () => {
  try {
    const response = await api.get("/logout");
    const { success, message } = await response.data;
    if (success) {
      localStorage.clear();
    }
  } catch (error) {
    console.log(error);
  }
};
