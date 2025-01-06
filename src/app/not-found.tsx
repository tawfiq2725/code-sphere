import Header from "@/app/components/header";
import Link from "next/link";

const Custom404 = () => {
  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <h1 className="text-6xl font-bold text-white">404</h1>
        <p className="mt-4 text-xl text-white">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link href="/">
          <p className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-blue-700">
            Go Back Home
          </p>
        </Link>
      </div>
    </>
  );
};

export default Custom404;
