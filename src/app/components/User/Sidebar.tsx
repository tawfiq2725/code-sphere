"use client";

import * as React from "react";
import {
  Gift,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingCart,
  Users,
  X,
  BookIcon,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slice/authSlice";
import { showToast } from "@/utils/toastUtil";
import { usePathname } from "next/navigation";

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

interface SidebarProps {
  onStateChange?: (state: { collapsed: boolean; mobileOpen: boolean }) => void;
  unreadCount: number;
  onMessageVisit?: () => void;
}

export default function Sidebar({ unreadCount, onMessageVisit }: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const isOnMessagePage = pathname === "/student/profile/message";
  const [messageVisited, setMessageVisited] = React.useState(false);

  React.useEffect(() => {
    if (isOnMessagePage && !messageVisited) {
      setMessageVisited(true);
      if (onMessageVisit) {
        onMessageVisit();
      }
    } else if (!isOnMessagePage) {
      setMessageVisited(false);
    }
  }, [pathname, messageVisited, onMessageVisit, isOnMessagePage]);

  const handleLogout = () => {
    dispatch(logout());
    showToast("Logged out successfully", "success");
  };

  const isMobile = () => window.innerWidth < 768;

  React.useEffect(() => {
    const handleResize = () => {
      if (isMobile()) {
        setCollapsed(true);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile()) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const sidebarWidth = collapsed ? "w-20" : "w-64";
  const sidebarClass = `fixed inset-y-0 left-0 z-40 flex flex-col bg-gray-900 text-white shadow-lg transition-all duration-300 ${
    isMobile()
      ? mobileOpen
        ? "translate-x-0"
        : "-translate-x-full"
      : sidebarWidth
  }`;
  const displayUnreadCount = !isOnMessagePage ? unreadCount : 0;

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 rounded-md bg-purple-700 p-2 text-white md:hidden"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="flex">
        <aside className={sidebarClass}>
          <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6 text-purple-500" />
                <span className="text-xl font-bold">
                  {user?.user?.name || "Student"}
                </span>
              </div>
            )}
            {collapsed && (
              <LayoutDashboard className="mx-auto h-6 w-6 text-purple-500" />
            )}

            <button
              onClick={toggleSidebar}
              className="hidden rounded-full bg-gray-800 p-1 text-gray-300 hover:bg-gray-700 hover:text-white md:block"
            >
              {collapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const isChatItem = item.name === "Chat";

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    if (isChatItem && onMessageVisit) {
                      onMessageVisit();
                    }
                    if (isMobile()) {
                      setMobileOpen(false);
                    }
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-800 ${
                    isActive
                      ? "bg-purple-700 text-white"
                      : "text-gray-300 hover:text-white"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  {isChatItem ? (
                    <div className="relative">
                      <item.icon className="h-5 w-5" />
                      {displayUnreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {displayUnreadCount}
                        </div>
                      )}
                    </div>
                  ) : (
                    <item.icon className="h-5 w-5" />
                  )}
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-800 p-4">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-gray-800 ${
                collapsed ? "justify-center w-full" : "w-full"
              }`}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div
          className={`transition-all duration-300 ${
            isMobile() ? "ml-0" : collapsed ? "ml-20" : "ml-64"
          }`}
        ></div>
      </div>
    </>
  );
}
