"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { showToast } from "@/utils/toastUtil";

const TutorProfile = () => {
  const [isEditable, setIsEditable] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    qualification: "",
    subjects: "",
    experience: "",
  });
  const [certificates, setCertificates] = useState<File[]>([]);

  let email = localStorage.getItem("email");
  let token = Cookies.get("jwt_token");

  const fetchProfile = async () => {
    try {
      let response = await fetch(
        `http://localhost:5000/tutor/profile?email=${email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      let data = await response.json();
      console.log(
        "----------------------This is dashboard data-----------------------------"
      );
      console.log(data.data);
      localStorage.setItem("tutor_id", data.data._id);
      if (!data.success) {
        showToast(data.message, "error");
      } else {
        setProfile({
          name: data.data.name || "",
          email: data.data.email || "",
          qualification: data.data.qualification || "",
          subjects: data.data.subjects || "",
          experience: data.data.experience || "",
        });
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

  const handleUpdateform = async (e: React.FormEvent) => {
    e.preventDefault();
    let tutor_id = localStorage.getItem("tutor_id");
    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      formData.append("qualification", profile.qualification);
      formData.append("subjects", profile.subjects);
      formData.append("experience", profile.experience);

      certificates.forEach((file) => {
        formData.append("certificates", file);
      });

      let response = await fetch(
        `http://localhost:5000/tutor/profile/${tutor_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      let data = await response.json();
      if (!data.success) {
        showToast(data.message, "error");
      } else {
        setProfile(data.data);
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
      const invalidFiles = files.filter(
        (file) => !allowedTypes.includes(file.type)
      );
      if (invalidFiles.length > 0) {
        showToast(
          "Only image files (JPEG, PNG, JPG, GIF) are allowed. Invalid files have been removed.",
          "error"
        );

        e.target.value = "";
      }
      setCertificates(validFiles);
    }
  };

  const toggleEditMode = () => setIsEditable(!isEditable);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-md w-full bg-gray-800 p-6 rounded-lg shadow-md my-10">
        <h2 className="text-center text-2xl font-bold mb-6">Profile</h2>
        <form onSubmit={handleUpdateform}>
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
