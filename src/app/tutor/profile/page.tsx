"use client";
import type React from "react";
import { useEffect, useState } from "react";
import { showToast } from "@/utils/toastUtil";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { getUserDetails } from "@/store/slice/authSlice";
import api from "@/api/axios";
import { signedUrltoNormalUrl } from "@/utils/presignedUrl";

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
  const email = localStorage.getItem("userEmail");

  const fetchProfile = async () => {
    try {
      const response = await api.get("/tutor/profile", {
        params: { email },
      });
      const { data, success, message } = await response.data;
      if (data.profile) {
        let profile = signedUrltoNormalUrl(data.profile);
        data.profile = profile;
      }
      if (data.certificates) {
        data.certificates = data.certificates.map((cert: string) =>
          signedUrltoNormalUrl(cert)
        );
      }

      dispatch(getUserDetails({ user: data }));

      localStorage.setItem("tutor_id", data._id);
      if (!success) {
        showToast(message, "error");
      } else {
        dispatch(getUserDetails({ user: data }));
      }
    } catch (error) {
      console.error("Error fetching user details", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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

      const response = await api.patch("/tutor/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { success, message, data } = await response.data;

      if (!success) {
        showToast(message, "error");
      } else {
        if (data.profile) {
          const url = signedUrltoNormalUrl(data.profile);
          data.profile = url;
        }
        if (data.certificates) {
          const updatedCertificates = data.certificates.map((cert: string) =>
            signedUrltoNormalUrl(cert)
          );
          data.certificates = updatedCertificates;
        }
        setUploadedCertificates(data.certificates);
        showToast("Profile updated successfully", "success");
        dispatch(getUserDetails({ user: data }));
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
    "w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200";

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
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-black flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-extrabold text-white text-center mb-8">
            Tutor Profile
          </h1>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Profile Details */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Profile Details</h2>
              <div className="flex items-center space-x-6">
                <div className="w-28 h-28 relative rounded-full overflow-hidden border-4 border-purple-500">
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
                <div>
                  <input
                    type="file"
                    onChange={handleProfilePictureChange}
                    accept=".jpg, .jpeg, .png, .webp, image/jpeg, image/png, image/webp"
                    className="text-sm text-gray-400 file:py-2 file:px-4 file:border file:border-purple-500 file:rounded-md file:bg-purple-600 file:text-white hover:file:bg-purple-700 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-4">
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
                  className={`${inputClass} opacity-70 cursor-not-allowed`}
                  autoComplete="off"
                />
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleInputChange}
                  placeholder="Bio"
                  className={`${inputClass} resize-none h-28`}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Professional Details */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">
                Professional Details
              </h2>
              <div className="space-y-4">
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
                  accept=".jpg, .jpeg, .png, .bmp, .webp, .svg, .pdf, image/jpeg, image/png,  image/bmp, image/webp, image/svg+xml, application/pdf"
                  className={inputClass}
                  autoComplete="off"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Certificates
                </h3>
                <button
                  onClick={openModal}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                >
                  View Certificates
                </button>
              </div>
            </div>
          </div>
          <div className="mt-10 flex justify-center">
            <button
              onClick={handleUpdateProfile}
              disabled={loading || Object.keys(editedFields).length === 0}
              className={`px-8 py-3 bg-pink-500 text-white rounded-md hover:bg-purple-700 transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Updating..." : "Save Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* Certificates Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Certificates
            </h2>
            <div className="relative">
              {uploadedCertificates[currentCertificateIndex] &&
                (() => {
                  const fileUrl = uploadedCertificates[currentCertificateIndex];
                  // Remove query string before extracting the extension.
                  const fileWithoutQuery = fileUrl.split("?")[0];
                  const ext =
                    fileWithoutQuery.split(".").pop()?.toLowerCase() ?? "";

                  if (ext === "pdf") {
                    return (
                      <iframe
                        src={fileUrl}
                        title={`Certificate ${currentCertificateIndex + 1}`}
                        className="w-full h-96 border rounded-md"
                      ></iframe>
                    );
                  } else if (ext === "jpg" || ext === "jpeg" || ext === "png") {
                    return (
                      <Image
                        src={fileUrl}
                        alt={`Certificate ${currentCertificateIndex + 1}`}
                        width={400}
                        height={300}
                        objectFit="contain"
                        className="rounded-md"
                      />
                    );
                  } else {
                    return (
                      <p className="text-center text-gray-600">
                        Unsupported file type: {ext}
                      </p>
                    );
                  }
                })()}
              <button
                onClick={handlePrev}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-60 text-white p-2 rounded-l hover:bg-opacity-80 transition"
              >
                &#8249;
              </button>
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-60 text-white p-2 rounded-r hover:bg-opacity-80 transition"
              >
                &#8250;
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TutorProfile;
