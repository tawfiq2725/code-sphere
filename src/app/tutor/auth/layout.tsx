"use client";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { loadAuthFromCookies } from "@/store/slice/authSlice";
import Sidebar from "@/app/components/Tutor/sidebar";
import { showToast } from "@/utils/toastUtil";
export default function TutorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: any) => state.auth);
  useEffect(() => {
    // dispatch(loadAuthFromCookies());
    if (!user.user.isTutor) {
      showToast("Just verify your details first", "error");
      router.push("/tutor/profile");
    }
  }, [dispatch, router]);

  if (!user.user.isTutor) {
    return null;
  }

  return <>{children}</>;
}
