import Header from "@/app/components/header";
import { Mail, Phone, MapPin, MessageSquare, Compass } from "lucide-react";

export default function Contact() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <div className="pt-20 pb-12 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
              Contact Us
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              We're here for you: Connect with us for any questions or concerns.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 pb-24">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Cards */}
            <div className="space-y-6">
              {/* Support Card */}
              <div className="bg-gray-900 rounded-2xl p-8 shadow-lg border border-purple-900">
                <h2 className="text-2xl font-bold mb-6 text-purple-400">
                  Get In Touch
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-purple-600 p-3 rounded-lg mr-4">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Email Support</h3>
                      <p className="text-gray-300 mb-1">
                        For all inquiries and support
                      </p>
                      <p className="text-white font-medium">
                        support@codesphere.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-purple-600 p-3 rounded-lg mr-4">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Phone Support</h3>
                      <p className="text-gray-300 mb-1">
                        Monday-Friday, 9AM-6PM EST
                      </p>
                      <p className="text-white font-medium">(878) 787-8787</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-purple-600 p-3 rounded-lg mr-4">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Office Location</h3>
                      <p className="text-gray-300 mb-1">
                        Visit our headquarters
                      </p>
                      <p className="text-white font-medium">
                        123 Tech Plaza, San Francisco, CA 94105
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resources Card */}
              <div className="bg-gray-900 rounded-2xl p-8 shadow-lg border border-purple-900">
                <h2 className="text-2xl font-bold mb-6 text-purple-400">
                  Additional Resources
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-purple-600 p-3 rounded-lg mr-4">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Community Forum</h3>
                      <p className="text-gray-300">
                        For technical questions, please post on our forum where
                        you can get help from fellow students and experts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-purple-600 p-3 rounded-lg mr-4">
                      <Compass className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Learning Paths</h3>
                      <p className="text-gray-300">
                        For course suggestions and career advice, check out our
                        comprehensive learning paths.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Location */}
            <div className="flex flex-col space-y-4">
              <div className="bg-gray-900 rounded-2xl p-8 shadow-lg border border-purple-900">
                <h2 className="text-2xl font-bold mb-6 text-purple-400">
                  Find Us
                </h2>

                {/* Map container with aspect ratio */}
                <div className="relative w-full h-0 pb-[75%] rounded-lg overflow-hidden border-2 border-purple-800">
                  {/* Placeholder for map - in a real implementation, you would use Google Maps or another map provider */}
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    {/* This is a placeholder - replace with actual map */}
                    <div className="text-center p-4">
                      <MapPin className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                      <p className="text-white font-medium mb-2">
                        CodeSphere Headquarters
                      </p>
                      <p className="text-gray-400">
                        123 Tech Plaza, San Francisco, CA 94105
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-2">
                    Hours of Operation
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-gray-300">
                    <p>Monday - Friday:</p>
                    <p>9:00 AM - 6:00 PM</p>
                    <p>Saturday:</p>
                    <p>10:00 AM - 4:00 PM</p>
                    <p>Sunday:</p>
                    <p>Closed</p>
                  </div>
                </div>
              </div>

              {/* Social Media Card */}
              <div className="bg-gray-900 rounded-2xl p-8 shadow-lg border border-purple-900">
                <h2 className="text-2xl font-bold mb-4 text-purple-400">
                  Connect With Us
                </h2>
                <p className="text-gray-300 mb-6">
                  Follow us on social media for updates, tips, and more
                </p>

                <div className="flex space-x-4">
                  {/* Social Media Icons - these would be actual icons in implementation */}
                  <a
                    href="#"
                    className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center hover:bg-purple-500 transition-colors"
                  >
                    <span className="sr-only">Twitter</span>
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center hover:bg-purple-500 transition-colors"
                  >
                    <span className="sr-only">GitHub</span>
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center hover:bg-purple-500 transition-colors"
                  >
                    <span className="sr-only">LinkedIn</span>
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center hover:bg-purple-500 transition-colors"
                  >
                    <span className="sr-only">YouTube</span>
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
