"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { showToast } from "@/utils/toastUtil";
import { backendUrl } from "@/utils/backendUrl";
import Image from "next/image";
import { getUserDetails } from "@/store/slice/authSlice";
import { useDispatch, useSelector } from "react-redux";

const TutorProfile = () => {
  const [isEditable, setIsEditable] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    qualification: string;
    subjects: string;
    experience: string;
    profilePicture: string | File;
  }>({
    name: "",
    email: "",
    qualification: "",
    subjects: "",
    experience: "",
    profilePicture: "",
  });
  const [certificates, setCertificates] = useState<File[]>([]);
  const [uploadedCertificates, setUploadedCertificates] = useState<string[]>(
    []
  );

  const email = localStorage.getItem("userEmail");
  const token = Cookies.get("jwt_token");

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
      console.log("checkkk user details code", data.data);
      localStorage.setItem("tutor_id", data.data._id);
      if (!data.success) {
        showToast(data.message, "error");
      } else {
        dispatch(getUserDetails({ user: data.data }));
        setProfile({
          name: data.data.name || "",
          email: data.data.email || "",
          qualification: data.data.qualification || "",
          subjects: data.data.subjects || "",
          experience: data.data.experience || "",
          profilePicture: data.data.profile || "/default-profile.jpg",
        });
        setUploadedCertificates(data.data.certificates || []);
        showToast("Profile fetched successfully", "success");
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch profile", "error");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const tutor_id = localStorage.getItem("tutor_id");
    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      formData.append("qualification", profile.qualification);
      formData.append("subjects", profile.subjects);
      formData.append("experience", profile.experience);

      certificates.forEach((file) => formData.append("certificates", file));
      formData.append("profilePhoto", profile.profilePicture);

      const response = await fetch(`${backendUrl}/tutor/profile/${tutor_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (!data.success) {
        showToast(data.message, "error");
      } else {
        setProfile({
          ...profile,
          profilePicture: data.data.profilePicture,
        });
        setUploadedCertificates(data.data.certificates);
        showToast("Profile updated successfully", "success");
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to update profile", "error");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
      ];
      const validFiles = files.filter((file) =>
        allowedTypes.includes(file.type)
      );
      if (validFiles.length !== files.length) {
        showToast(
          "Only image files (JPEG, PNG, JPG, GIF) are allowed.",
          "error"
        );
      }
      setCertificates(validFiles);
    }
  };

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setProfile({ ...profile, profilePicture: e.target.files[0] });
    }
  };

  const toggleEditMode = () => setIsEditable(!isEditable);
  const profilePicture =
    profile.profilePicture && typeof profile.profilePicture === "string"
      ? profile.profilePicture
      : "/default-profile.jpg";
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-md w-full bg-gray-800 p-6 rounded-lg shadow-md my-10">
        <h2 className="text-center text-2xl font-bold mb-6">Profile</h2>
        <form onSubmit={handleUpdateForm}>
          <div className="w-28 h-28 mx-auto mb-2 overflow-hidden rounded-full">
            <Image
              src={profilePicture}
              alt="Avatar"
              width={100}
              height={100}
              layout="responsive" // Maintains aspect ratio automatically
              objectFit="cover" // Ensures the image covers the container
              priority
              className="rounded-full" // Additional safety for rounding images
            />

            {isEditable && (
              <input
                type="file"
                name="profilePicture"
                onChange={handleProfilePictureChange}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none"
              />
            )}
          </div>
          {/* Name Field */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
              disabled={!isEditable}
              className={`w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none ${
                !isEditable ? "cursor-not-allowed" : ""
              }`}
            />
          </div>
          {/* Other Fields */}
          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleInputChange}
              disabled
              className={`w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none ${
                !isEditable ? "cursor-not-allowed" : ""
              }`}
            />
          </div>

          {/* Qualification Field */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Qualification</label>
            <input
              type="text"
              name="qualification"
              value={profile.qualification || ""}
              onChange={handleInputChange}
              disabled={!isEditable}
              className={`w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none ${
                !isEditable ? "cursor-not-allowed" : ""
              }`}
            />
          </div>

          {/* Specialization Field */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Specialization</label>
            <input
              type="text"
              name="subjects"
              value={profile.subjects || ""}
              onChange={handleInputChange}
              disabled={!isEditable}
              className={`w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none ${
                !isEditable ? "cursor-not-allowed" : ""
              }`}
            />
          </div>
          {/* Certificates Field */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Add Certificates</label>
            <input
              type="file"
              name="certificates"
              onChange={handleFileChange}
              disabled={!isEditable}
              multiple
              className={`w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none ${
                !isEditable ? "cursor-not-allowed" : ""
              }`}
            />
          </div>

          {/* Experience Field */}
          <div className="mb-6">
            <label className="block text-sm mb-1">Experience</label>
            <input
              type="text"
              name="experience"
              value={profile.experience || ""}
              onChange={handleInputChange}
              disabled={!isEditable}
              className={`w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none ${
                !isEditable ? "cursor-not-allowed" : ""
              }`}
            />
          </div>
          {/* ... (rest of the fields) */}

          <div className="mb-4">
            <label className="block text-sm mb-1">Uploaded Certificates</label>
            {uploadedCertificates.length > 0 ? (
              uploadedCertificates.map((cert, index) => (
                <div key={index} className="flex justify-between">
                  <a
                    href={cert}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400"
                  >
                    View Certificate {index + 1}
                  </a>
                </div>
              ))
            ) : (
              <p>No certificates uploaded yet.</p>
            )}
          </div>
          {/* Buttons */}
          <div className="flex justify-between">
            <button
              type={isEditable ? "button" : "submit"}
              onClick={toggleEditMode}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded focus:outline-none"
            >
              {isEditable ? "Save Profile" : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TutorProfile;
