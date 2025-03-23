import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { logoutUser } from "@/utils/logout";
import { showToast } from "@/utils/toastUtil";
import { backendUrl } from "@/utils/backendUrl";

const axiosInstance = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach JWT if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
interface QueueItem {
  resolve: (value?: string | null) => void;
  reject: (error?: any) => void;
}

let failedQueue: QueueItem[] = [];

interface ProcessQueueArgs {
  error: Error | null;
  token: string | null;
}

const processQueue = (
  error: ProcessQueueArgs["error"],
  token: ProcessQueueArgs["token"] = null
): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axiosInstance.post(
          `${backendUrl}/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data; // Assumes new token is at data.data
        localStorage.setItem("jwt_token", newToken);

        const decodedToken = jwtDecode(data.data) as { role: string };
        let role = decodedToken.role;
        localStorage.setItem("role", role);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        showToast("Session expired. Please login again.", "error");
        localStorage.clear();
        logoutUser();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    } else if (status === 403) {
      showToast("Access denied. Logging out.", "error");
      localStorage.clear();
      logoutUser();
    } else {
      showToast(error.response?.data.message || "An error occurred", "error");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
