import React from "react";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 pb-10">
      <div className="text-center w-4/5 mt-10 ">
        <h1 className="text-2xl md:text-5xl font-bold mb-4">
          All the Skills You Need to Succeed in Coding
        </h1>
        <p className="text-lg md:text-xl text-gray-400">
          Master coding with structured, no-fluff courses that take you from
          beginner to pro — designed to build real, practical skills you can use
          every day.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Plan 1 */}
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg relative">
          <span className="absolute top-4 right-4 bg-pink-500 text-xs font-bold text-white px-2 py-1 rounded">
            50% Off
          </span>
          <h2 className="text-4xl font-extrabold">$500/y</h2>
          <p className="text-pink-500 mt-2 text-sm line-through">$1000/y</p>
          <ul className="mt-6 space-y-3 text-gray-300">
            <li>✔️ Access to 50 courses</li>
            <li>✔️ Get all future courses FREE</li>
            <li>✔️ 320 hours of video</li>
            <li>✔️ Downloadable content</li>
            <li>✔️ Practical, hands-on exercises</li>
            <li>✔️ English captions</li>
            <li>✔️ Certificate of completion</li>
            <li>✔️ Flexible learning, anytime</li>
          </ul>
          <button className="mt-6 w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg">
            Start Learning Now
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Join risk-free — Cancel anytime!
          </p>
        </div>

        {/* Plan 2 */}
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg relative">
          <span className="absolute top-4 right-4 bg-pink-500 text-xs font-bold text-white px-2 py-1 rounded">
            Most Popular
          </span>
          <h2 className="text-4xl font-extrabold">$50/m</h2>
          <p className="text-pink-500 mt-2 text-sm line-through">$100/y</p>
          <ul className="mt-6 space-y-3 text-gray-300">
            <li>✔️ Access to 50 courses</li>
            <li>✔️ Get all future courses FREE</li>
            <li>✔️ 320 hours of video</li>
            <li>✔️ Downloadable content</li>
            <li>✔️ Practical, hands-on exercises</li>
            <li>✔️ English captions</li>
            <li>✔️ Certificate of completion</li>
            <li>✔️ Flexible learning, anytime</li>
          </ul>
          <button className="mt-6 w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg">
            Start Learning Now
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Join risk-free — Cancel anytime!
          </p>
        </div>
      </div>
    </div>
  );
}
