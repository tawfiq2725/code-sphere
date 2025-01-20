"use client";

import { backendUrl } from "@/utils/backendUrl";
import { showToast } from "@/utils/toastUtil";
import { allFieldsValidation } from "@/utils/validators";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    allFieldsValidation({ email }, showToast, setIsLoading);

    try {
      const response = await fetch(backendUrl + "/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();
      localStorage.setItem("userEmail", email);

      if (data.success) {
        showToast("OTP sent successfully.", "success");
        router.push("/auth/forgotpass/verify-otp");
      } else {
        showToast(data.message || "Failed to send OTP.", "error");
      }
    } catch (error: any) {
      console.error(error);
      showToast("Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
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
