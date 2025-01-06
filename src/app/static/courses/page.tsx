import React from "react";
import Header from "@/app/components/header";
import Link from "next/link";
const courses = () => {
  return (
    <>
      <Header />
      <h1>
        <title>Level Up Your Coding Skills</title>
      </h1>
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <h1 className="text-5xl font-bold mb-8">Level Up Your Coding Skills</h1>
        <p className="text-lg mb-12 max-w-xl text-center">
          Whether you want to excel in web development, mobile development, or
          strengthen your fundamental software engineering skills, there is a
          course for you.
        </p>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search Courses"
            className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Link href="/static/courses">
            <p className="w-32 ml-4 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600">
              All Courses
            </p>
          </Link>
        </div>
      </main>
    </>
  );
};

export default courses;
