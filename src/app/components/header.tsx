"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
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
            <Link href="/static/courses" className="hover:text-gray-400">
              Courses
            </Link>
            <Link href="/static/membership" className="hover:text-gray-400">
              Membership
            </Link>
            <Link href="/static/learning-path" className="hover:text-gray-400">
              Learning Path
            </Link>
            <Link href="/static/contact" className="hover:text-gray-400">
              Contact
            </Link>
          </div>

          {/* Sign In Button */}
          {/* Auth Buttons */}
          <div className="hidden md:flex">
            {user ? (
              <button
                onClick={logout}
                className="bg-white text-black py-1 px-4 rounded-lg hover:bg-gray-300"
              >
                Logout
              </button>
            ) : (
              <Link href="/auth/sign-in">
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
            <Link href="/courses" className="block py-2 hover:text-gray-400">
              Courses
            </Link>
            <Link href="/membership" className="block py-2 hover:text-gray-400">
              Membership
            </Link>
            <Link
              href="/learning-path"
              className="block py-2 hover:text-gray-400"
            >
              Learning Path
            </Link>
            <Link href="/contact" className="block py-2 hover:text-gray-400">
              Contact
            </Link>
            <Link href="/signin" className="block py-2 hover:text-gray-400">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
