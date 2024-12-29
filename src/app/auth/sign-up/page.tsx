"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Common from "@/app/components/Common";
import { showToast } from "@/utils/toastUtil";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (!data.success) {
        showToast(data.message, "error");
      } else {
        showToast(data.message, "success");
        setFormData({
          student_name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "",
        });
        router.push("/auth/otp-verification");
      }
    } catch (error) {
      showToast((error as any).message, "error");
    }
    setTimeout(() => setIsLoading(false), 1000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6 text-white">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Register Your Account</h1>
          <p className="text-zinc-400 text-sm">
            Create an account to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-200"
            >
              Name
            </label>
            <input
              id="student_name"
              name="student_name"
              type="text"
              value={formData.student_name}
              onChange={handleChange}
              placeholder="Jane Smith"
              required
              className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-200"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
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
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                required
                className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-zinc-200"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Same as password"
                required
                className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
                <span className="sr-only">
                  {showConfirmPassword ? "Hide password" : "Show password"}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-zinc-200"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="" disabled>
                Select...
              </option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating account..." : "Register"}
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

        {/* Social Button */}
        <Common />

        {/* Footer Link */}
        <div className="text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="text-purple-400 hover:text-purple-300 hover:underline underline-offset-4"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
