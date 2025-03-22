import Header from "@/app/components/header";
import {
  BookOpen,
  Code,
  Server,
  Smartphone,
  Gamepad,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function LearningPaths() {
  const paths = [
    {
      title: "Fundamentals",
      description:
        "Essential courses for anyone pursuing a career as a professional software engineer.",
      icon: <BookOpen className="w-8 h-8" />,
      courses: 12,
      difficulty: "Beginner",
      duration: "3 months",
    },
    {
      title: "Front-end Development",
      description:
        "All the courses you need to build beautiful websites: HTML, CSS, JavaScript, React, and more!",
      icon: <Code className="w-8 h-8" />,
      courses: 18,
      difficulty: "Intermediate",
      duration: "4 months",
    },
    {
      title: "Back-end Development",
      description:
        "All the courses you need to build powerful APIs for web and mobile apps: Node, Django, ASP.NET.",
      icon: <Server className="w-8 h-8" />,
      courses: 16,
      difficulty: "Advanced",
      duration: "5 months",
    },
    {
      title: "Mobile Development",
      description:
        "All the courses you need to build professional, cross-platform mobile apps using React Native.",
      icon: <Smartphone className="w-8 h-8" />,
      courses: 14,
      difficulty: "Intermediate",
      duration: "4 months",
    },
    {
      title: "Game Development",
      description: "The fundamental courses you need to build games.",
      icon: <Gamepad className="w-8 h-8" />,
      courses: 15,
      difficulty: "Advanced",
      duration: "6 months",
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white">
        {/* Hero Section with Purple Gradient */}
        <div className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-black"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-64 h-64 bg-purple-600 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-800 rounded-full filter blur-3xl opacity-10"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
              Learning Paths
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Discover your optimal learning journey and unlock your full
              potential as a developer.
            </p>
          </div>
        </div>

        {/* Learning Paths Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {paths.map((path, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] border border-gray-800 hover:border-purple-500"
              >
                {/* Top accent line with animation */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600 transform origin-left transition-transform duration-500 group-hover:scale-x-100"></div>

                <div className="p-8">
                  {/* Icon and title section */}
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-purple-900/50 rounded-lg mr-4">
                      {path.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {path.title}
                    </h2>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 mb-8">{path.description}</p>

                  {/* CTA button */}
                  <Link href={`/static/courses`}>
                    <button className="w-full py-3 px-6 flex items-center justify-center bg-purple-700 hover:bg-purple-600 rounded-lg text-white font-medium transition-colors duration-300">
                      Explore Path
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="relative bg-gradient-to-br from-gray-900 to-black border-t border-purple-900/50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Not sure where to start?
            </h2>
            <p className="text-gray-300 mb-8">
              Take our quick courses to find the perfect learning path based on
              your skills and goals.
            </p>
            <Link href={`/static/courses`}>
              <button className="py-4 px-8 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 rounded-lg text-white font-medium text-lg transition-all duration-300 transform hover:scale-105">
                Explore courses
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
