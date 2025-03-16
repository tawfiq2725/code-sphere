"use client";
import Header from "@/app/components/User/header";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { loadAuthFromCookies } from "@/store/slice/authSlice";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, role } = useSelector((state: any) => state.auth);
  useEffect(() => {
    dispatch(loadAuthFromCookies());
    if (!isAuthenticated || role !== "student") {
      router.push("/auth/sign-in");
    }
  }, [dispatch, isAuthenticated, role, router]);
  if (!isAuthenticated || role !== "student") {
    return;
  }
  return (
    <>
      <Header />
      {children}
    </>
  );
}
