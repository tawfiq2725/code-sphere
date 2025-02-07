"use client";

import { findUserById, getChaptersById, getCoursById } from "@/api/course";
import { use, useEffect, useState } from "react";
import { Clock, IndianRupee, BookOpen, HelpCircle } from "lucide-react";
import Header from "@/app/components/header";
import Image from "next/image";
import Link from "next/link";
import { getByNameById } from "@/api/category";
import ChapterAccordion from "@/app/components/common/ChapterAccordian";

interface Course {
  _id: string;
  courseName: string;
  courseDescription: string;
  info: string;
  duration: string;
  thumbnail: string;
  courseId: string;
  category: string;
  price: number;
  sellingPrice: number;
  tutorId: string;
  categoryName: string;
}

interface Tutor {
  name: string;
  bio: string;
  profile: string;
  email: string;
}

export default function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [courseData, setCourseData] = useState<Course>();
  const [tutorId, setTutorId] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [tutorData, setTutorData] = useState<Tutor>();
  const [category, setCategory] = useState<string>();
  const [categoryData, setCategoryData] = useState<any>();
  const [chapters, setChapters] = useState<any>();

  // Fetch course details
  useEffect(() => {
    getCoursById(id)
      .then((data) => {
        setCourseData(data.data);
        setTutorId(data.data.tutorId);
        setCategory(data.data.categoryName);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (courseData) {
      document.title = courseData.courseName;
    }
  }, [courseData]);

  useEffect(() => {
    if (tutorId) {
      findUserById(tutorId).then((data) => {
        setTutorData(data);
      });
    }
  }, [tutorId]);

  useEffect(() => {
    getChaptersById(id).then((data) => {
      console.log("chapters", data);
      setChapters(data);
    });
  }, [id]);

  useEffect(() => {
    if (category) {
      console.log("Fetching category for ID:", category);
      getByNameById(category).then((data) => {
        setCategoryData(data);
        console.log("Fetched category data:", data);
      });
    }
  }, [category]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Course not found</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {courseData.courseName}
              </h1>
              <p className="text-gray-400 text-lg mb-6">
                {courseData.courseDescription}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={`/student/enroll/${courseData.courseId}`}>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium">
                    Enroll Now
                  </button>
                </Link>
                <div className="flex items-center text-2xl font-bold text-purple-400">
                  <IndianRupee className="w-6 h-6 mr-1" />
                  {courseData.sellingPrice}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              {courseData.thumbnail ? (
                <img
                  src={courseData.thumbnail || "/placeholder.svg"}
                  alt={courseData.courseName}
                  className="w-full max-w-md rounded-lg object-cover"
                />
              ) : (
                <div className="bg-purple-900/20 w-full max-w-md aspect-video rounded-lg flex items-center justify-center">
                  <BookOpen className="w-20 h-20 text-purple-600" />
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-[240px,1fr] gap-12">
            <nav className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Course Information</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>More Info</span>
                </li>
                <li className="flex items-center space-x-3">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span>Category</span>
                </li>
                <li className="flex items-center space-x-3">
                  <IndianRupee className="w-4 h-4 text-purple-600" />
                  <span>Price: ₹{courseData.sellingPrice}</span>
                </li>
              </ul>
            </nav>

            <div className="space-y-12">
              <section>
                <div className="flex items-center space-x-2 mb-6">
                  <h2 className="text-2xl font-bold">About the Course</h2>
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-400 leading-relaxed">
                    {courseData.info}
                  </p>
                </div>
              </section>
              <section>
                <div className="flex items-center space-x-2 mb-6">
                  <h2 className="text-2xl font-bold">Chapters</h2>
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="prose prose-invert max-w-none">
                  {chapters?.map((chapter: any, index: number) => (
                    <ChapterAccordion key={index} chapter={chapter} />
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-2 mb-6">
                  <h2 className="text-2xl font-bold">Course Details</h2>
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-gray-900/50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">Course ID</h3>
                    <p className="text-gray-400">{courseData.courseId}</p>
                  </div>
                  <div className="bg-gray-900/50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">Category</h3>
                    <p className="text-gray-400">{categoryData}</p>
                  </div>
                  <div className="bg-gray-900/50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">More Info</h3>
                    <p className="text-gray-400">{courseData.info}</p>
                  </div>
                  <div className="bg-gray-900/50 p-6 rounded-lg ">
                    <h3 className="font-semibold mb-2">Tutor Details</h3>
                    <div className="flex flex-col justify-center">
                      {/* Profile Image */}
                      <div className="w-20 h-20 mb-4 rounded-full overflow-hidden border-2 border-gray-600 shadow-sm">
                        <Image
                          src={tutorData?.profile || "/default-profile.jpg"}
                          alt={tutorData?.name || "Tutor"}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                          priority
                        />
                      </div>

                      <h2 className="text-xl font-bold text-white mb-2">
                        {tutorData?.name || "Tutor Name"}
                      </h2>

                      {tutorData?.bio ? (
                        <p className="text-gray-400 text-pretty mb-4">
                          {tutorData.bio}
                        </p>
                      ) : (
                        <p className="text-gray-400 text-center mb-4 italic">
                          No bio provided.
                        </p>
                      )}

                      <div className="flex flex-col justify-center space-y-1">
                        <p className="text-gray-500">
                          <span className="font-semibold text-gray-300">
                            Email:
                          </span>{" "}
                          {tutorData?.email || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
