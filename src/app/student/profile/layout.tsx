"use client";
import Sidebar from "@/app/components/User/Sidebar";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ">{children}</div>
    </div>
  );
}
