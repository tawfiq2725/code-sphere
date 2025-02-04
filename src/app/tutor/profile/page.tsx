"use client";
import type React from "react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { showToast } from "@/utils/toastUtil";
import { backendUrl } from "@/utils/backendUrl";
import Image from "next/image";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { getUserDetails } from "@/store/slice/authSlice";

const TutorProfile = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    qualification: string;
    subjects: string;
    experience: string;
    bio: string;
    profileImage: string | File;
  }>({
    name: "",
    email: "",
    qualification: "",
    subjects: "",
    experience: "",
    bio: "",
    profileImage: "",
  });
  const [certificates, setCertificates] = useState<File[]>([]);
  const [uploadedCertificates, setUploadedCertificates] = useState<string[]>(
    []
  );
  const [loading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedFields, setEditedFields] = useState<Record<string, boolean>>({});
  const [currentCertificateIndex, setCurrentCertificateIndex] = useState(0);
  const dispatch = useDispatch();
  const token = Cookies.get("jwt_token");
  const email = localStorage.getItem("userEmail");

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `${backendUrl}/tutor/profile?email=${email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      localStorage.setItem("tutor_id", data.data._id);
      if (!data.success) {
        showToast(data.message, "error");
      } else {
        dispatch(getUserDetails({ user: data.data }));
      }
    } catch (error) {
      console.error("Error fetching user details", error);
    }
  };

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.user.name || "",
        email: user.user.email || "",
        qualification: user.user.qualification || "",
        subjects: user.user.subjects || "",
        experience: user.user.experience || "",
        bio: user.user.bio || "",
        profileImage: user.user.profile ?? "/default-profile.jpg",
      });
      setUploadedCertificates(user.user.certificates || []);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();

      Object.keys(editedFields).forEach((field) => {
        if (editedFields[field]) {
          formData.append(field, profile[field as keyof typeof profile]);
        }
      });

      certificates.forEach((file) => formData.append("certificates", file));
      formData.append("email", profile.email);

      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await fetch(`${backendUrl}/tutor/profile/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log("Response from backend:", data);

      if (!data.success) {
        showToast(data.message, "error");
      } else {
        setUploadedCertificates(data.data.certificates);
        showToast("Profile updated successfully", "success");
        fetchProfile();
        setEditedFields({});
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("Failed to update profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
    setEditedFields({ ...editedFields, [name]: true });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setCertificates(files);
      setEditedFields({ ...editedFields, certificates: true });
    }
  };

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfile((prev) => ({
        ...prev,
        profileImage: file,
      }));
      setEditedFields((prev) => ({
        ...prev,
        profileImage: true,
      }));
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handlePrev = () => {
    setCurrentCertificateIndex((prev) =>
      prev === 0 ? uploadedCertificates.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentCertificateIndex((prev) =>
      prev === uploadedCertificates.length - 1 ? 0 : prev + 1
    );
  };

  const inputClass =
    "w-full px-3 py-2 border rounded bg-gray-800 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all duration-200";
  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"
            role="status"
          ></div>
        </div>
      )}
      <div className="container mx-auto px-10 py-8 bg-black">
        <div className="flex flex-col justify-center items-center  bg-gray-800 p-6 rounded-lg shadow-md my-10">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-2xl text-white font-bold">Profile Details</h2>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 relative">
                  {profile.profileImage && (
                    <Image
                      src={
                        typeof profile.profileImage === "string"
                          ? profile.profileImage
                          : profile.profileImage instanceof File
                          ? URL.createObjectURL(profile.profileImage)
                          : "/default-profile.jpg"
                      }
                      alt="Profile"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-full"
                    />
                  )}
                </div>
                <input
                  type="file"
                  onChange={handleProfilePictureChange}
                  className="w-2/4 px-3 py-2 border rounded bg-gray-800 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500
                         transition-all duration-200"
                />
              </div>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                placeholder="Name"
                className={inputClass}
                autoComplete="off"
              />
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                placeholder="Email"
                disabled
                className={inputClass}
                autoComplete="off"
              />
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                placeholder="Bio"
                className={`${inputClass} resize-none h-32`}
                autoComplete="off"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl text-white font-bold">
                Professional Details
              </h2>
              <input
                type="text"
                name="qualification"
                value={profile.qualification}
                onChange={handleInputChange}
                placeholder="Qualification"
                className={inputClass}
                autoComplete="off"
              />
              <input
                type="text"
                name="subjects"
                value={profile.subjects}
                onChange={handleInputChange}
                placeholder="Specialization"
                className={inputClass}
                autoComplete="off"
              />
              <input
                type="text"
                name="experience"
                value={profile.experience}
                onChange={handleInputChange}
                placeholder="Experience"
                className={inputClass}
                autoComplete="off"
              />
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                className={inputClass}
                autoComplete="off"
              />
              <div>
                <h3 className="text-lg text-white font-semibold mb-2">
                  Certificates
                </h3>
                <button
                  onClick={openModal}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-700"
                >
                  View Certificates
                </button>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleUpdateProfile}
              disabled={loading || Object.keys(editedFields).length === 0}
              className={`px-6 py-2 bg-pink-500 text-white rounded hover:bg-purple-700 
    ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Updating..." : "Save Profile"}
            </button>
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-lg max-w-lg w-full">
                <h2 className="text-2xl font-bold mb-4">Certificates</h2>
                <div className="relative">
                  {/* Conditional Rendering for File Types */}
                  {uploadedCertificates[currentCertificateIndex] && (
                    <>
                      {uploadedCertificates[currentCertificateIndex].endsWith(
                        ".pdf"
                      ) ? (
                        <iframe
                          src={uploadedCertificates[currentCertificateIndex]}
                          title={`Certificate ${currentCertificateIndex + 1}`}
                          className="w-full h-96"
                        ></iframe>
                      ) : uploadedCertificates[
                          currentCertificateIndex
                        ].endsWith(".jpg") ||
                        uploadedCertificates[currentCertificateIndex].endsWith(
                          ".jpeg"
                        ) ||
                        uploadedCertificates[currentCertificateIndex].endsWith(
                          ".png"
                        ) ? (
                        <Image
                          src={uploadedCertificates[currentCertificateIndex]}
                          alt={`Certificate ${currentCertificateIndex + 1}`}
                          width={400}
                          height={300}
                          objectFit="contain"
                        />
                      ) : (
                        <p className="text-center">
                          Unsupported file type:{" "}
                          {uploadedCertificates[currentCertificateIndex]
                            .split(".")
                            .pop()}
                        </p>
                      )}
                    </>
                  )}
                  <button
                    onClick={handlePrev}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-l"
                  >
                    &#8249;
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-r"
                  >
                    &#8250;
                  </button>
                </div>
                <button
                  onClick={closeModal}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TutorProfile;
