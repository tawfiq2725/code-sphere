import { showToast } from "./toastUtil";

export const logoutUser = async () => {
  try {
    const response = await fetch("http://localhost:5000/logout", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (data.success) {
      localStorage.clear();
    } else {
      showToast(data.message, "error");
    }
  } catch (error: any) {
    console.error(error);
  }
};
