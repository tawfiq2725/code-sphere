"use client";

import { useState } from "react";
import Link from "next/link";
import Common from "@/app/components/Common";
import { useRouter } from "next/navigation";
import { showToast } from "@/utils/toastUtil";
import { backendUrl } from "@/utils/backendUrl";
import { allFieldsValidation } from "@/utils/validators";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/slice/authSlice";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    allFieldsValidation({ email, password }, showToast, setIsLoading);
    // ithu form submission
    try {
      const respone = await fetch(backendUrl + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const data = await respone.json();
      console.log(data);
      console.log(data.data.role);
      // inga role handle pandra
      if (!data.success) {
        showToast(data.message, "error");
      } else if (data.data.role === "student") {
        console.log("ithuuuuuu token inga check pannu " + data.data.jwt_token);
        dispatch(
          loginSuccess({ token: data.data.jwt_token, role: data.data.role })
        );
        showToast(data.message, "success");
        router.push("/");
      } else if (data.data.role === "admin") {
        showToast(data.message, "success");
        router.push("/auth/admin/dashboard");
      } else {
        showToast("Wrong Page It is redirected into Respective Page", "error");
        router.push("/auth/tutor/sign-in");
      }
    } catch (error) {
      console.log(error);
    }
    setTimeout(() => setIsLoading(false), 1000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6 text-white">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Welcome back Tutor</h1>
          <p className="text-zinc-400 text-sm">
            Enter your email to sign in to your account
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
              required
              className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-200"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-700"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-900 px-2 text-zinc-400">
              Or continue with
            </span>
          </div>
        </div>
        {/* Social Icon  */}
        <Common />
        {/* Footer Links */}
        <div className="space-y-4">
          <div className="text-center text-sm text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="text-purple-400 hover:text-purple-300 hover:underline underline-offset-4"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
