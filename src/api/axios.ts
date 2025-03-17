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

// Variables for refresh logic
let isRefreshing = false;
interface QueueItem {
  resolve: (value?: string | null) => void;
  reject: (error?: any) => void;
}

let failedQueue: QueueItem[] = [];

// Helper to process queued requests after a token refresh attempt
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

// Response interceptor: handle 401 (Unauthorized) and 403 (Forbidden)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      // If a refresh is already in progress, queue this request.
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

      // Mark the request for retry and set the refreshing flag.
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
      // Handle forbidden requests
      showToast("Access denied. Logging out.", "error");
      localStorage.clear();
      logoutUser();
    } else {
      // Other errors can be handled here as needed
      showToast(error.response?.data.message || "An error occurred", "error");
      logoutUser();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

// import { toast } from "react-toastify";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import { logout } from "@/store/slice/authSlice";
// import { backendUrl } from "@/utils/backendUrl";

// const axiosInstance = axios.create({
//   baseURL: backendUrl,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// axiosInstance.interceptors.request.use(
//   async (config) => {
//     const token = localStorage.getItem("jwt_token");
//     console.log(token, "check");
//     console.log("Auth Token (Before Request):", token);
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     console.log("working.......1");
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       console.log("accessToken expired trying to refresh.....");
//       originalRequest._retry = true;
//       console.log("working.......2");

//       try {
//         const { data } = await axiosInstance.post(
//           `${process.env.NEXT_PUBLIC_BACKEND_URL}/refresh`,
//           {},
//           { withCredentials: true }
//         );
//         console.log("working.......3");
//         console.log("New Access Token:", data.data);
//         localStorage.setItem("jwt_token", data.data);
// const decodedToken = jwtDecode(data.data) as { role: string };
// console.log("working.......4");
// console.log("Decoded Role:", decodedToken.role);
// let role = decodedToken.role;
// localStorage.setItem("role", role);
//         console.log("working.......5");
//         originalRequest.headers.Authorization = `Bearer ${data.data}`;
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         toast.error("Session expired. Please login again.");
//         localStorage.clear();
//         window.location.reload();
//       }
//     } else {
//       toast.error(error.response.data.message);
//       logoutUser()
//     }
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;
