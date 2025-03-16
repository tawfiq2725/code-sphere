import { toast } from "react-toastify";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { logout } from "@/store/slice/authSlice";
import { backendUrl } from "@/utils/backendUrl";
import { showToast } from "@/utils/toastUtil";

const axiosInstance = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axiosInstance.post(
          `${backendUrl}/refresh`,
          {},
          { withCredentials: true }
        );
        localStorage.setItem("jwt_token", data.data);
        const decodedToken = jwtDecode(data.data) as { role: string };
        localStorage.setItem("role", decodedToken.role);
        originalRequest.headers.Authorization = `Bearer ${data.data}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        showToast("Session expired. Please login again.", "error");
        localStorage.clear();
        logout();
        window.location.reload();
      }
    } else if (status === 403) {
      showToast("Access denied. Logging out.", "error");
      localStorage.clear();
      logout();
      window.location.reload();
    } else {
      showToast(error.response?.data.message, "error");
      logout();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
