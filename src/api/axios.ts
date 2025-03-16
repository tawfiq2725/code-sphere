// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import { logout } from "@/store/slice/authSlice";
// import { backendUrl } from "@/utils/backendUrl";
// import { showToast } from "@/utils/toastUtil";
// import { logoutUser } from "@/utils/logout";

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
//     const status = error.response?.status;

//     if (status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const { data } = await axiosInstance.post(
//           `${backendUrl}/refresh`,
//           {},
//           { withCredentials: true }
//         );
//         localStorage.setItem("jwt_token", data.data);
//         const decodedToken = jwtDecode(data.data) as { role: string };
//         localStorage.setItem("role", decodedToken.role);
//         originalRequest.headers.Authorization = `Bearer ${data.data}`;
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         showToast("Session expired. Please login again.", "error");
//         localStorage.clear();
//         logout();
//         window.location.reload();
//       }
//     } else if (status === 403) {
//       showToast("Access denied. Logging out.", "error");
//       localStorage.clear();
//       logout();
//       window.location.reload();
//     } else {
//       showToast(error.response?.data.message, "error");
//       logout();
//     }
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;
import { toast } from "react-toastify";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { logout } from "@/store/slice/authSlice";
import { backendUrl } from "@/utils/backendUrl";

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
    console.log(token, "check");
    console.log("Auth Token (Before Request):", token);
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
    console.log("working.......1");
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("accessToken expired trying to refresh.....");
      originalRequest._retry = true;
      console.log("working.......2");

      try {
        const { data } = await axiosInstance.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/refresh`,
          {},
          { withCredentials: true }
        );
        console.log("working.......3");
        console.log("New Access Token:", data.data);
        localStorage.setItem("jwt_token", data.data);
        const decodedToken = jwtDecode(data.data) as { role: string };
        console.log("working.......4");
        console.log("Decoded Role:", decodedToken.role);
        let role = decodedToken.role;
        localStorage.setItem("role", role);
        console.log("working.......5");
        originalRequest.headers.Authorization = `Bearer ${data.data}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        window.location.reload();
      }
    } else {
      toast.error(error.response.data.message);
      logout();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
