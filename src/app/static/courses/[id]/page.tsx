"use client";

import {
  findUserById,
  getChaptersById,
  getCoursById,
  getCourseReviwes,
} from "@/api/course";
import { getByNameById } from "@/api/category";
import { getOffers } from "@/api/user/user";
import { use, useEffect, useRef, useState } from "react";
import {
  Clock,
  IndianRupee,
  BookOpen,
  HelpCircle,
  StarIcon,
  MessageCircleReply,
  Lock,
} from "lucide-react";
import Header from "@/app/components/header";
import Image from "next/image";
import Link from "next/link";
import { ChapterAccordion } from "@/app/components/common/ChapterAccordian";
import { signedUrltoNormalUrl } from "@/utils/presignedUrl";
import TutorCard from "@/app/components/User/TutorCard";
import { User } from "@/interface/user";

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
  averageRating: number;
  reviewCount: number;
}

interface CourseWithOffer extends Course {
  offerPrice?: number;
  discountPercentage?: number;
}

interface Offer {
  _id: string;
  offerName: string;
  discount: number;
  categoryId: {
    _id: string;
    categoryName: string;
    status: boolean;
  };
  startsFrom: string;
  endsFrom: string;
  status: boolean;
}

export default function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [courseData, setCourseData] = useState<CourseWithOffer>();
  const [tutorId, setTutorId] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [tutorData, setTutorData] = useState<User>();
  const [category, setCategory] = useState<string>();
  const [categoryData, setCategoryData] = useState<any>();
  const [chapters, setChapters] = useState<any>();
  const [reviews, setReviews] = useState<string[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [hasOffer, setHasOffer] = useState(false);
  const [offerPrice, setOfferPrice] = useState<number>();
  const [discountPercentage, setDiscountPercentage] = useState<number>();
  const [visibleReviews, setVisibleReviews] = useState(3);

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
    getCourseReviwes(id)
      .then((data) => {
        setReviews(data.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id]);

  if (courseData) {
    courseData.thumbnail = signedUrltoNormalUrl(courseData.thumbnail);
  }
  if (tutorData?.profile) {
    tutorData.profile = signedUrltoNormalUrl(tutorData.profile);
  }

  // Fetch offers
  useEffect(() => {
    getOffers()
      .then((response) => {
        if (response && response.data) {
          setOffers(response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching offers:", error);
      });
  }, []);

  useEffect(() => {
    if (courseData && category && offers && offers.length > 0) {
      const activeOffers = offers.filter((offer) => offer.status === true);
      const matchingOffer = activeOffers.find(
        (offer) => offer.categoryId._id === category
      );

      if (matchingOffer) {
        const discount = matchingOffer.discount;
        const discountAmount = (courseData.sellingPrice * discount) / 100;
        const discountedPrice = Math.floor(
          courseData.sellingPrice - discountAmount
        );
        setOfferPrice(discountedPrice);
        setDiscountPercentage(discount);
        setHasOffer(true);
      } else {
        setHasOffer(false);
        setOfferPrice(undefined);
        setDiscountPercentage(undefined);
      }
    }
  }, [courseData, category, offers]);

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
      setChapters(data);
    });
  }, [id]);

  useEffect(() => {
    if (category) {
      getByNameById(category).then((data) => {
        setCategoryData(data);
      });
    }
  }, [category]);
  const sectionRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };
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
  console.log(courseData.thumbnail);
  return (
    <>
      <Header />
      <div ref={sectionRef} className="min-h-screen bg-black text-white">
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
                <div className="flex items-center text-2xl font-bold">
                  {hasOffer && offerPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 flex items-center">
                        <IndianRupee className="w-6 h-6 mr-1" />
                        {offerPrice}
                      </span>
                      <span className="text-lg line-through text-gray-400">
                        ₹{courseData.sellingPrice}
                      </span>
                      <span className="text-sm bg-green-500 text-white px-2 py-1 rounded">
                        {discountPercentage}% OFF
                      </span>
                    </div>
                  ) : (
                    <span className="text-purple-400 flex items-center">
                      <IndianRupee className="w-6 h-6 mr-1" />
                      {courseData.sellingPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end relative">
              {courseData.thumbnail ? (
                <>
                  <Image
                    width={50}
                    height={50}
                    priority
                    src={courseData.thumbnail || "/placeholder.svg"}
                    alt={courseData.courseName}
                    className="w-full max-w-md rounded-lg object-cover"
                  />
                  {hasOffer && discountPercentage && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-bl-lg">
                      {discountPercentage}% OFF
                    </div>
                  )}
                </>
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
                  <span>
                    {hasOffer && offerPrice ? (
                      <span>
                        Price:{" "}
                        <span className="text-green-400">₹{offerPrice}</span>{" "}
                        <span className="line-through text-gray-500">
                          ₹{courseData.sellingPrice}
                        </span>
                      </span>
                    ) : (
                      <span>Price: ₹{courseData.sellingPrice}</span>
                    )}
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <StarIcon className="w-4 h-4 text-purple-600" />
                  <span>Ratings:</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <StarIcon
                        key={index}
                        className={`w-4 h-4 ${
                          index < Math.round(courseData.averageRating)
                            ? "text-purple-600"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </li>
                {hasOffer && discountPercentage && (
                  <li className="flex items-center space-x-3">
                    <div className="w-4 h-4 flex items-center justify-center text-purple-600">
                      %
                    </div>
                    <span className="text-green-400">
                      Save {discountPercentage}% with our special offer!
                    </span>
                  </li>
                )}
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
              <section className="bg-gray-900 p-6 rounded-lg">
                <div className="flex items-center space-x-2 mb-6">
                  <h2 className="text-2xl font-bold text-white">Chapters</h2>
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  {chapters?.map((chapter: any, index: any) => (
                    <ChapterAccordion
                      key={index}
                      chapter={chapter}
                      index={index}
                      isFirstChapter={index === 0}
                      scrollToTop={scrollToTop}
                    />
                  ))}
                </div>

                {chapters && chapters.length > 1 && (
                  <div className="mt-6 bg-purple-900 bg-opacity-30 p-4 rounded-lg border border-purple-800">
                    <div className="flex items-center">
                      <Lock className="w-5 h-5 text-purple-400 mr-3" />
                      <p className="text-white">
                        Unlock all chapters by upgrading to premium
                      </p>
                    </div>
                    <button
                      onClick={scrollToTop}
                      className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors"
                    >
                      Upgrade Now
                    </button>
                  </div>
                )}
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
                  <TutorCard tutorData={tutorData} />
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-2 mb-6">
                  <h2 className="text-2xl font-bold">Reviews</h2>
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                    <MessageCircleReply className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    <>
                      {reviews
                        .slice(0, visibleReviews)
                        .filter((review: any) => review.description?.length > 1)
                        .map((review: any, index: number) => (
                          <div
                            key={index}
                            className="bg-gray-900/50 p-4 rounded-lg"
                          >
                            <div className="flex items-center mb-2">
                              <div className="flex items-center">
                                {[...Array(review.rating)].map((_, i) => (
                                  <StarIcon
                                    key={i}
                                    className="w-4 h-4 text-purple-600"
                                  />
                                ))}
                              </div>
                              <p className="text-gray-300 ml-2">
                                {review.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      {reviews.filter((r: any) => r.description?.length > 1)
                        .length > visibleReviews && (
                        <button
                          onClick={() => setVisibleReviews((prev) => prev + 3)}
                          className="mt-4 text-purple-400 hover:text-purple-300"
                        >
                          Load More Reviews
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-400">No reviews yet</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
