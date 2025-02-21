import React from "react";
import { useSelector } from "react-redux";

interface CertificateProps {
  studentName: string;
  courseName: string;
  tutorName: string;
  date: string;
}

const Certificate: React.FC<CertificateProps> = ({
  studentName,
  courseName,
  tutorName,
  date,
}) => {
  const { user } = useSelector((state: any) => state.auth);

  return (
    <div className="bg-[#FDF6E3] p-6 border-8 border-purple-900 text-center shadow-xl w-full max-w-2xl mx-auto relative overflow-visible">
      {/* Decorative Border */}
      <div className="absolute inset-0 m-4 border-4 border-double border-gold-600 pointer-events-none" />

      {/* Corner Decorations */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-gold-600 border-dashed" />
      <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-gold-600 border-dashed" />
      <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-gold-600 border-dashed" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-gold-600 border-dashed" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6 tracking-wider font-bold drop-shadow-md">
          Certificate of Completion
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-4">
          This is to certify that
        </p>
        <p className="text-2xl md:text-3xl font-[cursive] text-purple-900 mb-6 font-bold tracking-wide">
          {studentName}
        </p>
        <p className="text-lg md:text-xl text-gray-700 mb-4">
          has successfully completed the course
        </p>
        <p className="text-xl md:text-2xl font-semibold text-gray-900 mb-6 italic">
          {courseName} {/* Use courseName prop */}
        </p>
        <p className="text-lg md:text-xl text-gray-700 mb-8">
          Awarded on {date}
        </p>

        {/* Signatures */}
        <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-2xl mb-8">
          <div className="mb-4 md:mb-0">
            <p className="text-lg text-gray-700 font-medium">
              {tutorName || user?.user?.name || "Tutor Name"}
            </p>
            <hr className="w-32 border-2 border-gold-600 my-2" />
            <p className="text-sm text-gray-600">Course Instructor</p>
          </div>
          <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center shadow-md">
            <img src="/logo.png" alt="" className="w-10 h-10 text-center" />
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-lg text-gray-700 font-medium">
              Tawfiq Sirajudeen
            </p>
            <hr className="w-32 border-2 border-gold-600 my-2" />
            <p className="text-sm text-gray-600">CEO</p>
          </div>
        </div>
      </div>

      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern
            id="pattern"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M20 0 L24 12 L36 16 L24 20 L20 32 L16 20 L4 16 L16 12 Z"
              fill="#D4AF37"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#pattern)" />
        </svg>
      </div>
    </div>
  );
};

export default Certificate;
