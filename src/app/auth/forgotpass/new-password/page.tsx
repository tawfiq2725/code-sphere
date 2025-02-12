"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/utils/toastUtil";
import { backendUrl } from "@/utils/backendUrl";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const router = useRouter();
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    const email = localStorage.getItem("userEmail");
    // ithu form submission
    try {
      const respone = await fetch(backendUrl + "/new-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          confirm,
        }),
      });
      const data = await respone.json();
      if (!data.success) {
        showToast(data.message, "error");
      } else {
        showToast("Password Changed Successfully", "success");
        router.push("/student/sign-in");
      }
    } catch (error) {
      showToast("Your Blocked From Admin or Your not Registered", "error");
    }
    setTimeout(() => setIsLoading(false), 1000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6 text-white">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Change Password</h1>
          <p className="text-zinc-400 text-sm">Enter your easy password</p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-200"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              autoComplete="off"
              className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirm"
              className="block text-sm font-medium text-zinc-200"
            >
              Confirm Password
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="********"
              autoComplete="off"
              className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Changing..." : "Change"}
          </button>
        </form>
      </div>
    </div>
  );
}
