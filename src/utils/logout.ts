import { showToast } from "./toastUtil";
import api from "@/api/axios";

export const logoutUser = async () => {
  try {
    const response = await api.get("/logout");
    const { success, message } = await response.data;
    if (success) {
      localStorage.clear();
    } else {
      showToast(message, "error");
    }
  } catch (error) {
    console.error(error);
  }
};
