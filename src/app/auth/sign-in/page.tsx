"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignIn } from "@/app/components/common/Common";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "@/utils/toastUtil";
import { loginSuccess } from "@/store/slice/authSlice";
import { backendUrl } from "@/utils/backendUrl";
import { validateForm } from "@/utils/validators";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, role } = useSelector(
    (state: {
      auth: { isAuthenticated: boolean; role: "student" | "admin" | "tutor" };
    }) => state.auth
  );
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/sign-in");
      return;
    }
    const routes: Record<string, string> = {
      student: "/student",
      admin: "/admin/dashboard",
      tutor: "/tutor/dashboard",
    };
    router.push(routes[role] || "/auth/sign-in");
  }, [isAuthenticated, role]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please fill in all fields", "error");
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch(`${backendUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!data.data) throw new Error();

      const { jwt_token, role } = data.data;
      localStorage.setItem("userEmail", email);
      dispatch(loginSuccess({ token: jwt_token, role }));
      showToast(data.message, "success");

      const routes: Record<string, string> = {
        student: "/student",
        admin: "/admin/dashboard",
        tutor: "/tutor/dashboard",
      };
      router.push(routes[role] || "/auth/sign-in");
    } catch (error: any) {
      showToast("Contact Admin Something Went wrong", "error");
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6 text-white">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Welcome back</h1>
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
              autoComplete="off"
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
              autoComplete="off"
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
        <SignIn />
        {/* Footer Links */}
        <div className="space-y-4">
          <div className="text-center text-sm text-zinc-400 mb-2">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="text-purple-400 hover:text-purple-300 hover:underline underline-offset-4"
            >
              Sign up
            </Link>
            <br />
            <div className="py-5">
              <Link
                href="/auth/forgotpass"
                className="text-pink-500 hover:text-pink-100 hover:underline my-5"
              >
                Forgot Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
