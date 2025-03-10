"use client";

import * as React from "react";
import {
  BookOpen,
  Gift,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  TypeIcon,
  Users,
  X,
  FormInput,
  BookIcon,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slice/authSlice";
import { showToast } from "@/utils/toastUtil";

const navigation = [
  { name: "Profile", href: "/student/profile/my-profile", icon: Users },
  {
    name: "My Courses",
    href: "/student/profile/my-courses",
    icon: GraduationCap,
  },
  { name: "Orders", href: "/student/profile/my-orders", icon: ShoppingCart },
  { name: "Membership", href: "/student/profile/membership", icon: Gift },
  {
    name: "Certificates",
    href: "/student/profile/certificates",
    icon: BookIcon,
  },
  {
    name: "Chat",
    href: "/student/profile/message",
    icon: MessageCircle,
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [active, setActive] = React.useState("/dashboard");
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logout());
    showToast("Logged out successfully", "success");
  };

  const { user } = useSelector((state: any) => state.auth);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-20 z-50 rounded-md bg-gray-800 p-2 text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      {isOpen && (
        <>
          {/* Overlay to close sidebar when clicked */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)} // Close sidebar on overlay click
          />

          <aside className="fixed inset-y-0 left-0 z-50  flex flex-col bg-gray-900 text-white shadow-lg transition-transform">
            {/* Logo/Header */}
            <div className="flex h-16 items-center gap-2 border-b border-gray-800 px-6">
              <LayoutDashboard className="h-6 w-6" />
              <span className="text-xl font-bold">{user.user.name}</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => {
                const isActive = active === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      setActive(item.href);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-800 ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-gray-800 p-4">
              <button
                onClick={() => handleLogout()}
                className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-gray-800"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
