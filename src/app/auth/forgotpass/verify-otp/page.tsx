"use client";

import { backendUrl } from "@/utils/backendUrl";
import { showToast } from "@/utils/toastUtil";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();

    // Start countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((value, index) => {
      if (index < 6) newOtp[index] = value;
    });
    setOtp(newOtp);
  };

  // ithu vandhu otp resend pannum
  const handleResend = async () => {
    if (!canResend) return;
    setTimeLeft(30);
    setCanResend(false);
    // Simulate API call
    let email = localStorage.getItem("userEmail");
    try {
      const response = await fetch(backendUrl + "/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!data.success) {
        showToast(data.message, "error");
      } else {
        showToast(data.message, "success");
      }
    } catch (error) {
      showToast("Otp Resend Failed", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    let email = localStorage.getItem("userEmail");
    let otpFormated = otp.join("");
    try {
      let response = await fetch(backendUrl + "/verify-forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: otpFormated }),
      });
      let data = await response.json();
      if (!response.ok) {
        showToast(data.message, "error");
      } else {
        router.push("/auth/forgotpass/new-password");

        showToast(data.message, "success");
      }
    } catch (error) {
      showToast("Otp Wrong", "error");
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">OTP Verification</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input Group */}
          <div className="flex justify-between gap-2 sm:gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-semibold rounded-md 
                         bg-zinc-800 border-2 border-zinc-700 text-white 
                         focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500
                         transition-all duration-200"
              />
            ))}
          </div>

          {/* Timer and Resend */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">
              {timeLeft > 0 && `00:${timeLeft.toString().padStart(2, "0")}`}
            </span>
            <button
              type="button"
              onClick={handleResend}
              className={`text-right ${
                canResend
                  ? "text-purple-400 hover:text-purple-300 cursor-pointer"
                  : "text-zinc-600 cursor-not-allowed"
              }`}
              disabled={!canResend}
            >
              Resend
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={otp.some((digit) => !digit) || isLoading}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 
                     text-white rounded-md font-medium transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
}
