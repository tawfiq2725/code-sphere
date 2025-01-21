"use client";
import { useSelector } from "react-redux";
export default function Page() {
  const { user } = useSelector((state: any) => state.auth);
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold ">Welcome Code Sphere</h1>
    </div>
  );
}
