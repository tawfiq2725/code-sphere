"use client";
import { backendUrl } from "@/utils/backendUrl";
import { showToast } from "@/utils/toastUtil";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { getUserDetails } from "@/store/slice/authSlice";
import { useEffect } from "react";
export default function Page() {
  useEffect(() => {
    fetchProfile();
  }, []);
  const { user } = useSelector((state: any) => state.auth);

  const dispatch = useDispatch();
  const email = localStorage.getItem("userEmail");
  const token = Cookies.get("jwt_token");

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `${backendUrl}/tutor/profile?email=${email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      localStorage.setItem("tutor_id", data.data._id);
      if (!data.success) {
        showToast(data.message, "error");
      } else {
        dispatch(getUserDetails({ user: data.data }));
      }
    } catch (error) {
      console.error("Error fetching user details", error);
    }
  };
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold ">Welcome Code Sphere</h1>
    </div>
  );
}
