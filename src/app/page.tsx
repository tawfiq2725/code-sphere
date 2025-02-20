"use client";

import { StatItem } from "@/app/components/User/stat-item";
import { FeatureCard } from "@/app/components/User/feature-card";
import { CodeEditor } from "@/app/components/User/code-editor";
import TrustedSection from "./components/User/end-hero";
import { useEffect } from "react";
import { showToast } from "@/utils/toastUtil";
import Header from "@/app/components/header";

export default function Home() {
  useEffect(() => {
    showToast("Welcome to CodeSphere", "success");
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white px-10">
        <main className="container mx-auto px-4 py-16 space-y-24">
          {/* Hero Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Tired of Fluff?
                <br />
                Learn to Code the
                <br />
                Right Way.
              </h1>
              <p className="text-gray-400 text-lg md:text-xl max-w-lg">
                Stop wasting time. Our focused courses help you master practical
                skills with a clear path to success.
              </p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-lg text-lg">
                Start Learning
              </button>
            </div>
            <div className="relative">
              <CodeEditor />
            </div>
          </div>

          {/* Developer Section */}
          <section className="text-center space-y-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              We are Software Developers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatItem value="100K+" label="Active Users" />
              <StatItem value="100+" label="Premium Courses" />
              <StatItem value="20+" label="Years of Experience" />
              <StatItem value="50" label="Expert Instructors" />
            </div>
          </section>

          {/* Features Section */}
          <section className="space-y-24">
            <FeatureCard
              title="Perfectly Structured Courses"
              description="No more jumping between random YouTube tutorials. Follow a clear, logical path designed to build your skills step by step."
              imageUrl="/public/img-1.PNG"
              align="left"
            />
            <FeatureCard
              title="Clear and Bite-Sized Lessons"
              description="Each lesson is focused and fast-paced, so you can make real progress every day with a bite-sized learning approach averaging 5 minutes."
              imageUrl="/public/img-2.PNG"
              align="right"
            />
          </section>

          {/* Hero end Section */}
          <TrustedSection />
        </main>
      </div>
    </>
  );
}
