"use client";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Admin/sidebard";
import { loadAuthFromCookies } from "@/store/slice/authSlice";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, role } = useSelector((state: any) => state.auth);

  useEffect(() => {
    // dispatch(loadAuthFromCookies());
    if (!isAuthenticated || role !== "admin") {
      router.push("/auth/sign-in");
    }
  }, [dispatch, isAuthenticated, role, router]);

  if (!isAuthenticated || role !== "admin") {
    return null;
  }

  return (
    <>
      <Sidebar />
      {children}
    </>
  );
}
