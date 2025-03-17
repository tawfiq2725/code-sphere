import api from "@/api/axios";

export const logoutUser = async () => {
  try {
    const response = await api.get("/logout");
    const { success, message } = response.data;
    if (success) {
      localStorage.clear();
    } else {
      console.error("Logout unsuccessful:", message);
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
};
