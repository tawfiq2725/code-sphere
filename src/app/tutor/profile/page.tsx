// "use client";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import { showToast } from "@/utils/toastUtil";
// import { backendUrl } from "@/utils/backendUrl";
// import Image from "next/image";
// import { useDispatch, useSelector } from "react-redux";

// const TutorProfile = () => {
//   const [isEditable, setIsEditable] = useState(false);
//   const { user } = useSelector((state: any) => state.auth);
//   console.log("checkkk user details", user);
//   const [profile, setProfile] = useState<{
//     name: string;
//     email: string;
//     qualification: string;
//     subjects: string;
//     experience: string;
//     profilePicture: string | File;
//   }>({
//     name: "",
//     email: "",
//     qualification: "",
//     subjects: "",
//     experience: "",
//     profilePicture: "",
//   });
//   const [certificates, setCertificates] = useState<File[]>([]);
//   const [uploadedCertificates, setUploadedCertificates] = useState<string[]>(
//     []
//   );

//   const email = localStorage.getItem("userEmail");
//   const token = Cookies.get("jwt_token");

//   // use the redux state to get user details
//   useEffect(() => {
//     if (user) {
//       setProfile({
//         name: user.name || "",
//         email: user.email || "",
//         qualification: user.qualification || "",
//         subjects: user.subjects || "",
//         experience: user.experience || "",
//         profilePicture: user.profile || "/default-profile.jpg",
//       });
//       setUploadedCertificates(user.certificates || []);
//     }
//   }, [user]);

//   const handleUpdateForm = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const tutor_id = localStorage.getItem("tutor_id");
//     try {
//       const formData = new FormData();
//       formData.append("name", profile.name);
//       formData.append("email", profile.email);
//       formData.append("qualification", profile.qualification);
//       formData.append("subjects", profile.subjects);
//       formData.append("experience", profile.experience);

//       certificates.forEach((file) => formData.append("certificates", file));
//       formData.append("profilePhoto", profile.profilePicture);

//       const response = await fetch(`${backendUrl}/tutor/profile/${tutor_id}`, {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });
//       const data = await response.json();
//       if (!data.success) {
//         showToast(data.message, "error");
//       } else {
//         setProfile((prev) => ({
//           ...prev,
//           profilePicture: URL.createObjectURL(profile.profilePicture as File),
//         }));

//         setUploadedCertificates(data.data.certificates);
//         showToast("Profile updated successfully", "success");
//       }
//     } catch (error) {
//       console.error(error);
//       showToast("Failed to update profile", "error");
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setProfile({ ...profile, [name]: value });
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const files = Array.from(e.target.files);
//       const allowedTypes = [
//         "image/jpeg",
//         "image/png",
//         "image/jpg",
//         "image/gif",
//       ];
//       const validFiles = files.filter((file) =>
//         allowedTypes.includes(file.type)
//       );
//       if (validFiles.length !== files.length) {
//         showToast(
//           "Only image files (JPEG, PNG, JPG, GIF) are allowed.",
//           "error"
//         );
//       }
//       setCertificates(validFiles);
//     }
//   };

//   const handleProfilePictureChange = (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     if (e.target.files && e.target.files[0]) {
//       setProfile({ ...profile, profilePicture: e.target.files[0] });
//     }
//   };

//   const toggleEditMode = () => setIsEditable(!isEditable);
//   const profilePicture =
//     profile.profilePicture && typeof profile.profilePicture === "string"
//       ? profile.profilePicture
//       : "/default-profile.jpg";
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
//       <div className="max-w-md w-full bg-gray-800 p-6 rounded-lg shadow-md my-10">
//         <h2 className="text-center text-2xl font-bold mb-6">Profile</h2>
//         <form onSubmit={handleUpdateForm}>
//           <div className="w-28 h-28 mx-auto mb-2 overflow-hidden rounded-full">
//             <Image
//               src={profilePicture}
//               alt="Avatar"
//               width={100}
//               height={100}
//               layout="responsive"
//               objectFit="cover"
//               priority
//               className="rounded-full"
//             />
//           </div>
//           <div className="mb-4">
//             {isEditable && (
//               <input
//                 type="file"
//                 name="profilePicture"
//                 onChange={handleProfilePictureChange}
//                 className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none"
//               />
//             )}
//           </div>
// <div className="mb-4">
//   <label className="block text-sm mb-1">Name</label>
//   <input
//     type="text"
//     name="name"
//     value={profile.name}
//     onChange={handleInputChange}
//     disabled={!isEditable}
//     className={`w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none ${
//       !isEditable ? "cursor-not-allowed" : ""
//     }`}
//   />
// </div>
// <div className="mb-4">
//   <label className="block text-sm mb-1">Email</label>
//   <input
//     type="email"
//     name="email"
//     value={profile.email}
//     onChange={handleInputChange}
//     disabled
//     className={`w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none ${
//       !isEditable ? "cursor-not-allowed" : ""
//     }`}
//   />
// </div>

// <div className="mb-4">
//   <label className="block text-sm mb-1">Qualification</label>
//   <input
//     type="text"
//     name="qualification"
//     value={profile.qualification || ""}
//     onChange={handleInputChange}
//     disabled={!isEditable}
//     className={`w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none ${
//       !isEditable ? "cursor-not-allowed" : ""
//     }`}
//   />
// </div>

// <div className="mb-4">
//   <label className="block text-sm mb-1">Specialization</label>
//   <input
//     type="text"
//     name="subjects"
//     value={profile.subjects || ""}
//     onChange={handleInputChange}
//     disabled={!isEditable}
//     className={`w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none ${
//       !isEditable ? "cursor-not-allowed" : ""
//     }`}
//   />
// </div>
// <div className="mb-4">
//   <label className="block text-sm mb-1">Add Certificates</label>
//   <input
//     type="file"
//     name="certificates"
//     onChange={handleFileChange}
//     disabled={!isEditable}
//     multiple
//     className={`w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none ${
//       !isEditable ? "cursor-not-allowed" : ""
//     }`}
//   />
// </div>

// <div className="mb-6">
//   <label className="block text-sm mb-1">Experience</label>
//   <input
//     type="text"
//     name="experience"
//     value={profile.experience || ""}
//     onChange={handleInputChange}
//     disabled={!isEditable}
//     className={`w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none ${
//       !isEditable ? "cursor-not-allowed" : ""
//     }`}
//   />
// </div>
//           <div className="mb-4">
//             <label className="block text-sm mb-1">Uploaded Certificates</label>
//             {uploadedCertificates.length > 0 ? (
//               uploadedCertificates.map((cert, index) => (
//                 <div key={index} className="flex justify-between">
//                   <a
//                     href={cert}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-400"
//                   >
//                     View Certificate {index + 1}
//                   </a>
//                 </div>
//               ))
//             ) : (
//               <p>No certificates uploaded yet.</p>
//             )}
//           </div>
//           {/* Buttons */}
// <div className="flex justify-between">
//   <button
//     type={isEditable ? "button" : "submit"}
//     onClick={toggleEditMode}
//     className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded focus:outline-none"
//   >
//     {isEditable ? "Save Profile" : "Update Profile"}
//   </button>
// </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default TutorProfile;

// 2
// "use client";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import { showToast } from "@/utils/toastUtil";
// import { backendUrl } from "@/utils/backendUrl";
// import Image from "next/image";
// import { useDispatch, useSelector } from "react-redux";
// import Modal from "react-modal";

// const TutorProfile = () => {
//   const [isEditable, setIsEditable] = useState(false);
//   const { user } = useSelector((state: any) => state.auth);
//   const [profile, setProfile] = useState({
//     name: "",
//     email: "",
//     qualification: "",
//     subjects: "",
//     experience: "",
//     profilePicture: "",
//   });
//   const [certificates, setCertificates] = useState<File[]>([]);
//   const [uploadedCertificates, setUploadedCertificates] = useState<string[]>(
//     []
//   );

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentCertificateIndex, setCurrentCertificateIndex] = useState(0);

//   const token = Cookies.get("jwt_token");
//   console.log(user);
//   console.log(user.user.profile);
//   useEffect(() => {
//     if (user) {
//       setProfile({
//         name: user.user.name || "",
//         email: user.user.email || "",
//         qualification: user.user.qualification || "",
//         subjects: user.user.subjects || "",
//         experience: user.user.experience || "",
//         profilePicture: user.user.profile || "/default-profile.jpg",
//       });
//       setUploadedCertificates(user.user.certificates || []);
//     }
//   }, [user]);

//   console.log("profile", profile);
//   console.log("profile", profile.name);
//   console.log("profile", profile.profilePicture);
//   console.log("profile", profile.qualification);

//   const handleUpdateForm = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const formData = new FormData();
//       formData.append("name", profile.name);
//       formData.append("email", profile.email);
//       formData.append("qualification", profile.qualification);
//       formData.append("subjects", profile.subjects);
//       formData.append("experience", profile.experience);

//       certificates.forEach((file) => formData.append("certificates", file));
//       formData.append("profilePhoto", profile.profilePicture);

//       const response = await fetch(`${backendUrl}/tutor/profile`, {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });
//       const data = await response.json();
//       if (!data.success) {
//         showToast(data.message, "error");
//       } else {
//         setUploadedCertificates(data.data.certificates);
//         showToast("Profile updated successfully", "success");
//       }
//     } catch (error) {
//       showToast("Failed to update profile", "error");
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setProfile({ ...profile, [name]: value });
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const files = Array.from(e.target.files);
//       setCertificates(files);
//     }
//   };

//   const handleProfilePictureChange = (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       setProfile((prev) => ({
//         ...prev,
//         profilePicture: URL.createObjectURL(file),
//       }));
//     }
//   };

//   const toggleEditMode = () => setIsEditable(!isEditable);

//   const openModal = (index: number) => {
//     setCurrentCertificateIndex(index);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => setIsModalOpen(false);

//   const handlePrev = () => {
//     setCurrentCertificateIndex((prev) =>
//       prev === 0 ? uploadedCertificates.length - 1 : prev - 1
//     );
//   };

//   const handleNext = () => {
//     setCurrentCertificateIndex((prev) =>
//       prev === uploadedCertificates.length - 1 ? 0 : prev + 1
//     );
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
//       <div className="max-w-md w-full bg-gray-800 p-6 rounded-lg shadow-md my-10">
//         <h2 className="text-center text-2xl font-bold mb-6">Profile</h2>
//         <form onSubmit={handleUpdateForm}>
//           <div className="w-20 h-20 mx-auto mb-2 overflow-hidden rounded-full">
//             {profile.profilePicture ? (
//               <Image
//                 src={profile.profilePicture}
//                 alt="Avatar"
//                 className="object-cover rounded-full w-full h-full" // Key change here
//                 width={80}
//                 height={80}
//                 priority
//               />
//             ) : (
//               <div className="flex justify-center items-center bg-gray-300 rounded-full w-20 h-20">
//                 {" "}
//                 {/* Match the container size */}
//                 <span>No Image</span>
//               </div>
//             )}
//           </div>
//           <div className="mb-4">
//             {isEditable && (
//               <input
//                 type="file"
//                 name="profilePicture"
//                 onChange={handleProfilePictureChange}
//                 className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none"
//               />
//             )}
//           </div>
//           {/* Other form fields */}
//           <div className="mb-4">
//             <label className="block text-sm mb-1">Name</label>
//             <input
//               type="text"
//               name="name"
//               value={profile.name}
//               onChange={handleInputChange}
//               disabled={!isEditable}
//               className={`w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none ${
//                 !isEditable ? "cursor-not-allowed" : ""
//               }`}
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm mb-1">Email</label>
//             <input
//               type="email"
//               name="email"
//               value={profile.email}
//               onChange={handleInputChange}
//               disabled
//               className={`w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none ${
//                 !isEditable ? "cursor-not-allowed" : ""
//               }`}
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm mb-1">Qualification</label>
//             <input
//               type="text"
//               name="qualification"
//               value={profile.qualification || ""}
//               onChange={handleInputChange}
//               disabled={!isEditable}
//               className={`w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none ${
//                 !isEditable ? "cursor-not-allowed" : ""
//               }`}
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm mb-1">Specialization</label>
//             <input
//               type="text"
//               name="subjects"
//               value={profile.subjects || ""}
//               onChange={handleInputChange}
//               disabled={!isEditable}
//               className={`w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none ${
//                 !isEditable ? "cursor-not-allowed" : ""
//               }`}
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm mb-1">Add Certificates</label>
//             <input
//               type="file"
//               name="certificates"
//               onChange={handleFileChange}
//               disabled={!isEditable}
//               multiple
//               className={`w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none ${
//                 !isEditable ? "cursor-not-allowed" : ""
//               }`}
//             />
//           </div>

//           <div className="mb-6">
//             <label className="block text-sm mb-1">Experience</label>
//             <input
//               type="text"
//               name="experience"
//               value={profile.experience || ""}
//               onChange={handleInputChange}
//               disabled={!isEditable}
//               className={`w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none ${
//                 !isEditable ? "cursor-not-allowed" : ""
//               }`}
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm mb-1">Uploaded Certificates</label>
//             {uploadedCertificates.length > 0 ? (
//               uploadedCertificates.map((cert, index) => (
//                 <div key={index}>
//                   <button
//                     onClick={(e) => {
//                       e.preventDefault();
//                       openModal(index);
//                     }}
//                     className="text-blue-400 underline"
//                   >
//                     View Certificate {index + 1}
//                   </button>
//                 </div>
//               ))
//             ) : (
//               <p>No certificates uploaded yet.</p>
//             )}
//           </div>
//           <div className="flex justify-between">
//             <button
//               type={isEditable ? "button" : "submit"}
//               onClick={toggleEditMode}
//               className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded focus:outline-none"
//             >
//               {isEditable ? "Save Profile" : "Update Profile"}
//             </button>
//           </div>
//           {/* Modal */}
//           <Modal
//             isOpen={isModalOpen}
//             onRequestClose={closeModal}
//             contentLabel="Certificate Modal"
//             className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center p-4"
//             overlayClassName="fixed inset-0 bg-black bg-opacity-50"
//             ariaHideApp={false}
//           >
//             <div className="bg-gray-800 text-white p-4 rounded-lg w-96 max-w-full">
//               <button
//                 onClick={closeModal}
//                 className="absolute top-2 right-2 text-xl font-bold"
//               >
//                 &times;
//               </button>
//               <img
//                 src={uploadedCertificates[currentCertificateIndex]}
//                 alt="Certificate"
//                 className="w-full h-auto"
//               />
//               <div className="flex justify-between mt-4">
//                 <button
//                   onClick={handlePrev}
//                   className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
//                 >
//                   Prev
//                 </button>
//                 <button
//                   onClick={handleNext}
//                   className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </Modal>
//         </form>
//       </div>
//     </div>
//   );
// };
// export default TutorProfile;

// 3

// "use client";
// import type React from "react";
// import { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import { showToast } from "@/utils/toastUtil";
// import { backendUrl } from "@/utils/backendUrl";
// import Image from "next/image";
// import { useSelector } from "react-redux";
// import Modal from "react-modal";
// import { Button } from "@/app/components/ui/button";
// import { Input } from "@/app/components/ui/input";
// import { Label } from "@/app/components/ui/label";

// const TutorProfile = () => {
//   const { user } = useSelector((state: any) => state.auth);
//   const [profile, setProfile] = useState({
//     name: "",
//     email: "",
//     qualification: "",
//     subjects: "",
//     experience: "",
//     profilePicture: "",
//   });
//   const [certificates, setCertificates] = useState<File[]>([]);
//   const [uploadedCertificates, setUploadedCertificates] = useState<string[]>(
//     []
//   );
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentCertificateIndex, setCurrentCertificateIndex] = useState(0);

//   const token = Cookies.get("jwt_token");

//   useEffect(() => {
//     if (user) {
//       setProfile({
//         name: user.user.name || "",
//         email: user.user.email || "",
//         qualification: user.user.qualification || "",
//         subjects: user.user.subjects || "",
//         experience: user.user.experience || "",
//         profilePicture: user.user.profile || "/default-profile.jpg",
//       });
//       setUploadedCertificates(user.user.certificates || []);
//     }
//   }, [user]);

//   const handleUpdateField = async (field: string, value: string | File) => {
//     try {
//       const formData = new FormData();
//       formData.append(field, value);

//       const response = await fetch(`${backendUrl}/tutor/profile`, {
//         method: "PATCH",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });
//       const data = await response.json();
//       if (!data.success) {
//         showToast(data.message, "error");
//       } else {
//         setProfile((prev) => ({ ...prev, [field]: value }));
//         showToast(`${field} updated successfully`, "success");
//       }
//     } catch (error) {
//       showToast(`Failed to update ${field}`, "error");
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setProfile({ ...profile, [name]: value });
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const files = Array.from(e.target.files);
//       setCertificates(files);
//     }
//   };

//   const handleProfilePictureChange = async (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       await handleUpdateField("profilePicture", file);
//     }
//   };

//   const openModal = (index: number) => {
//     setCurrentCertificateIndex(index);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => setIsModalOpen(false);

//   const handlePrev = () => {
//     setCurrentCertificateIndex((prev) =>
//       prev === 0 ? uploadedCertificates.length - 1 : prev - 1
//     );
//   };

//   const handleNext = () => {
//     setCurrentCertificateIndex((prev) =>
//       prev === uploadedCertificates.length - 1 ? 0 : prev + 1
//     );
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
//       <div className="max-w-md w-full bg-card p-6 rounded-lg shadow-md my-10">
//         <h2 className="text-center text-2xl font-bold mb-6">Profile</h2>
//         <div className="w-20 h-20 mx-auto mb-2 overflow-hidden rounded-full">
//           <Image
//             src={profile.profilePicture || "/placeholder.svg"}
//             alt="Avatar"
//             className="object-cover rounded-full w-full h-full"
//             width={80}
//             height={80}
//             priority
//           />
//         </div>
//         <div className="mb-4">
//           <Input
//             type="file"
//             name="profilePicture"
//             onChange={handleProfilePictureChange}
//             className="w-full"
//           />
//         </div>
//         <div className="space-y-4">
//           {Object.entries(profile).map(([key, value]) => {
//             if (key !== "profilePicture" && key !== "email") {
//               return (
//                 <div key={key} className="flex flex-col space-y-2">
//                   <Label htmlFor={key}>
//                     {key.charAt(0).toUpperCase() + key.slice(1)}
//                   </Label>
//                   <Input
//                     type="text"
//                     id={key}
//                     name={key}
//                     value={value}
//                     onChange={handleInputChange}
//                     onBlur={(e) => handleUpdateField(key, e.target.value)}
//                   />
//                 </div>
//               );
//             }
//             return null;
//           })}
//         </div>
//         <div className="mb-4">
//           <Label htmlFor="certificates">Add Certificates</Label>
//           <Input
//             id="certificates"
//             type="file"
//             name="certificates"
//             onChange={handleFileChange}
//             multiple
//           />
//         </div>
//         <div className="mb-4">
//           <Label>Uploaded Certificates</Label>
//           {uploadedCertificates.length > 0 ? (
//             uploadedCertificates.map((cert, index) => (
//               <div key={index}>
//                 <Button
//                   onClick={() => openModal(index)}
//                   variant="link"
//                   className="text-primary"
//                 >
//                   View Certificate {index + 1}
//                 </Button>
//               </div>
//             ))
//           ) : (
//             <p>No certificates uploaded yet.</p>
//           )}
//         </div>
//         <Modal
//           isOpen={isModalOpen}
//           onRequestClose={closeModal}
//           contentLabel="Certificate Modal"
//           className="fixed inset-0 bg-background/80 flex justify-center items-center p-4"
//           overlayClassName="fixed inset-0 bg-background/50"
//           ariaHideApp={false}
//         >
//           <div className="bg-card text-card-foreground p-4 rounded-lg w-96 max-w-full">
//             <Button
//               onClick={closeModal}
//               className="absolute top-2 right-2"
//               variant="ghost"
//             >
//               &times;
//             </Button>
//             <img
//               src={
//                 uploadedCertificates[currentCertificateIndex] ||
//                 "/placeholder.svg"
//               }
//               alt="Certificate"
//               className="w-full h-auto"
//             />
//             <div className="flex justify-between mt-4">
//               <Button onClick={handlePrev} variant="secondary">
//                 Prev
//               </Button>
//               <Button onClick={handleNext} variant="secondary">
//                 Next
//               </Button>
//             </div>
//           </div>
//         </Modal>
//       </div>
//     </div>
//   );
// };

// export default TutorProfile;
