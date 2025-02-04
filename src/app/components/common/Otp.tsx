"use client";

import { backendUrl } from "@/utils/backendUrl";
import { showToast } from "@/utils/toastUtil";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import type React from "react"; // Added import for React

export default function OTPVerification({ userEmail }: { userEmail: string }) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    inputRefs.current[0]?.focus();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleChange = useCallback((index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;

    setOtp((prev) => {
      const newOtp = [...prev];
      newOtp[index] = value;
      return newOtp;
    });

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    setOtp(pastedData.split("").concat(Array(6 - pastedData.length).fill("")));
  }, []);

  const handleResend = useCallback(async () => {
    if (timeLeft > 0) return;
    setTimeLeft(30);
    try {
      const response = await fetch(`${backendUrl}/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await response.json();
      showToast(data.message, data.success ? "success" : "error");
    } catch (error) {
      showToast("OTP Resend Failed", "error");
    }
  }, [timeLeft, userEmail]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (otp.some((digit) => !digit) || isLoading) return;

      setIsLoading(true);
      try {
        const response = await fetch(`${backendUrl}/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, otp: otp.join("") }),
        });
        const data = await response.json();
        if (response.ok) {
          router.push("/auth/sign-in");
          localStorage.clear();
          showToast(data.message, "success");
        } else {
          showToast(data.message, "error");
        }
      } catch (error) {
        showToast("OTP Verification Failed", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [otp, isLoading, userEmail, router]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-2xl font-bold text-white text-center">
          OTP Verification
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">
              {timeLeft > 0 && `00:${timeLeft.toString().padStart(2, "0")}`}
            </span>
            <button
              type="button"
              onClick={handleResend}
              className={`text-right ${
                timeLeft === 0
                  ? "text-purple-400 hover:text-purple-300 cursor-pointer"
                  : "text-zinc-600 cursor-not-allowed"
              }`}
              disabled={timeLeft > 0}
            >
              Resend
            </button>
          </div>

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
