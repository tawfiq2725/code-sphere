"use client";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { loadAuthFromCookies } from "@/store/slice/authSlice";
import Sidebar from "@/app/components/Tutor/sidebar";
export default function TutorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, role } = useSelector((state: any) => state.auth);
  useEffect(() => {
    dispatch(loadAuthFromCookies());
    if (!isAuthenticated || role !== "tutor") {
      router.push("/auth/sign-in");
    }
  }, [dispatch, isAuthenticated, role, router]);

  if (!isAuthenticated || role !== "tutor") {
    return null;
  }

  return (
    <>
      <Sidebar />
      {children}
    </>
  );
}
