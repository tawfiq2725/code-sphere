"use client";

import { showToast } from "@/utils/toastUtil";
import api from "@/api/axios";
import React, { useState } from "react";
import Otp from "@/app/components/common/Otp-Forgot";

const Page = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpPage, setOtpPage] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      showToast("Email is required.", "error");
      setIsLoading(false);
      return;
    }

    try {
      localStorage.setItem("userEmail", email);
      const response = await api.post("/forgot-password", { email });
      const { success, message } = await response.data;
      if (success) {
        showToast(message || "OTP sent successfully.", "success");
        setOtpPage(true);
      } else {
        showToast(message || "Failed to send OTP.", "error");
      }
    } catch (error: any) {
      console.error(error);
      showToast("Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  }
  if (otpPage) {
    return <Otp userEmail={email} />;
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6 text-white">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-zinc-400 text-sm">
            Enter your email to reset the password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-200"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              autoComplete="off"
              className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
