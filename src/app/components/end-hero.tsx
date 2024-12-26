import Link from "next/link";

export default function TrustedSection() {
  return (
    <section className="bg-black text-white py-16 px-4">
      <div className="container mx-auto max-w-3xl text-center space-y-6">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
          Trusted by Employees at Leading Companies
        </h2>

        <p className="text-gray-400 text-lg md:text-xl">
          My courses are used by professionals from top companies like
          Microsoft, Amazon, and Google, helping them sharpen their skills and
          stay ahead in their fields.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg h-auto text-lg w-full sm:w-auto">
            <Link href="/courses">Browse Courses</Link>
          </button>

          <button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg h-auto text-lg w-full sm:w-auto">
            <Link href="/signup">Join for Free</Link>
          </button>
        </div>
      </div>
    </section>
  );
}
