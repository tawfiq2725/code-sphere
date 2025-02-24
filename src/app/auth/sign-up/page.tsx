"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/api/axios";
import { SignIn } from "@/app/components/common/Common";
import { showToast } from "@/utils/toastUtil";
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
} from "@/utils/validators";
import dynamic from "next/dynamic";
import { Eye, EyeConfirm } from "@/app/components/common/Eye";
const OtpPage = dynamic(() => import("@/app/components/common/Otp"), {
  loading: () => <div>Loading OTP...</div>,
});
export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    import("@/app/components/common/Otp");
  }, []);

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

    // Validate all form fields
    const allFieldsFilled = Object.values(formData).every(
      (field) => field.trim() !== ""
    );
    if (!allFieldsFilled) {
      showToast("All fields are required", "error");
      return;
    }

    // Validate email
    const emailError = validateEmail(formData.email);
    if (emailError !== true) {
      showToast(emailError as string, "error");
      return;
    }

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError !== true) {
      showToast(passwordError as string, "error");
      return;
    }

    // Validate confirm password
    const confirmPasswordError = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );
    if (confirmPasswordError !== true) {
      showToast(confirmPasswordError as string, "error");
      return;
    }

    setIsLoading(true);

    try {
      // Sign up API call
      const response = await api.post("/user", formData);
      const { success, message } = response.data;
      if (!success) {
        showToast(message, "error");
        return;
      }
      showToast(message, "success");

      // Store user email and update local state
      localStorage.setItem("userEmail", formData.email);
      setUserEmail(formData.email);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
      });

      // Send OTP API call
      const otpResponse = await api.post("/send-otp", {
        email: formData.email,
      });
      if (!otpResponse.data.success) {
        showToast("Failed to send OTP", "error");
      } else {
        showToast("OTP sent successfully", "success");
        setIsOtpStep(true);
      }
    } catch (error: any) {
      showToast(
        error.message || "Something went wrong. Please contact admin.",
        "error"
      );
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  }

  if (isOtpStep) {
    return <OtpPage userEmail={userEmail} />;
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
          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-200"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              autoComplete="off"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Jane Smith"
              className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Email */}
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
              type="text"
              autoComplete="off"
              value={formData.email}
              onChange={handleChange}
              placeholder="jane@example.com"
              className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Password */}
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
                autoComplete="off"
                onChange={handleChange}
                placeholder="********"
                className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Eye
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            </div>
          </div>

          {/* Confirm Password */}
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
                autoComplete="off"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Same as password"
                className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <EyeConfirm
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
              />
            </div>
          </div>

          {/* Role */}
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
              className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="" disabled>
                Select...
              </option>
              <option value="student">Student</option>
              <option value="tutor">Teacher</option>
            </select>
          </div>

          {/* Submit Button */}
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

        {/* Social Sign-In */}
        <SignIn />

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
