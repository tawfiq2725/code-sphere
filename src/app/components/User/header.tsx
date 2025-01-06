"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/store/slice/authSlice";
import { showToast } from "@/utils/toastUtil";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const { isAuthenticated, role } = useSelector((state: any) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    showToast("Logged out successfully", "success");
  };

  return (
    <nav className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <div className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="CodeSphere Logo"
                  width={40}
                  height={40}
                />
                <span className="ml-2 text-xl font-bold">CodeSphere</span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link
              href="/static/courses"
              className="block py-2 hover:text-gray-400"
            >
              Courses
            </Link>
            <Link
              href="/static/membership"
              className="block py-2 hover:text-gray-400"
            >
              Membership
            </Link>
            <Link
              href="/static/learning-path"
              className="block py-2 hover:text-gray-400"
            >
              Learning Path
            </Link>
            <Link
              href="/static/contact"
              className="block py-2 hover:text-gray-400"
            >
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex">
            {isAuthenticated && role === "student" ? (
              <button
                className="bg-red-500 text-white py-1 px-4 rounded-lg hover:bg-red-600"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <Link href="/student/sign-in">
                <button className="bg-white text-black py-1 px-4 rounded-lg hover:bg-gray-300">
                  Sign In
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              className="text-gray-400 hover:text-white focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <Link
              href="/static/courses"
              className="block py-2 hover:text-gray-400"
            >
              Courses
            </Link>
            <Link
              href="/static/membership"
              className="block py-2 hover:text-gray-400"
            >
              Membership
            </Link>
            <Link
              href="/static/learning-path"
              className="block py-2 hover:text-gray-400"
            >
              Learning Path
            </Link>
            <Link
              href="/static/contact"
              className="block py-2 hover:text-gray-400"
            >
              Contact
            </Link>
            {isAuthenticated && role === "student" ? (
              <button
                className="block py-2 text-red-500 hover:text-red-600"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <Link
                href="/student/sign-in"
                className="block py-2 hover:text-gray-400"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
