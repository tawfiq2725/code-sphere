// "use client";

// import { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import Pagination from "@/app/components/common/pagination";
// import { showToast } from "@/utils/toastUtil";
// import { useSelector } from "react-redux";
// import {
//   getCoupons,
//   addCoupon,
//   updateCoupon,
//   toggleCoupon,
// } from "@/api/coupon/coupon";

// export default function CouponManagement() {
//   interface Coupon {
//     _id: string;
//     couponName: string;
//     couponCode: string;
//     couponDiscount: number;
//     startDate: Date;
//     expireAt: Date;
//     couponStatus: boolean;
//   }

//   const token: any = Cookies.get("jwt_token");
//   const { user } = useSelector((state: any) => state.auth);
//   const [coupons, setCoupons] = useState<Coupon[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(5);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [editModal, setEditModal] = useState(false);
//   const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
//   const [couponData, setCouponData] = useState({
//     couponName: "",
//     couponCode: "",
//     couponDiscount: 0,
//     expireAt: "",
//   });

//   useEffect(() => {
//     getCoupons(token)
//       .then((data) => {
//         setCoupons(data.data);
//       })
//       .catch((err) => {
//         console.error("Failed to fetch coupons data:", err);
//         showToast("Failed to fetch course data", "error");
//       });
//   }, [token]);

//   const handleToggleCoupon = async (id: string) => {
//     await toggleCoupon(id, token);
//     setCoupons((prev) =>
//       prev.map((c) =>
//         c._id === id ? { ...c, couponStatus: !c.couponStatus } : c
//       )
//     );
//   };

//   const handleAddCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (
//       !couponData.couponName ||
//       !couponData.couponCode ||
//       !couponData.couponDiscount ||
//       !couponData.expireAt
//     ) {
//       return showToast("Please fill all the fields", "error");
//     }
//     console.log(couponData);

//     if (couponData.couponDiscount <= 0 || couponData.couponDiscount >= 100) {
//       return showToast("Please enter a valid discount value", "error");
//     }

//     if (new Date(couponData.expireAt) < new Date()) {
//       return showToast("Please enter a valid expiry date", "error");
//     }

//     const couponRegex = /^[A-Za-z0-9]{6,10}$/;
//     if (!couponRegex.test(couponData.couponCode)) {
//       return showToast(
//         "Please enter a valid coupon code (6-10 alphanumeric characters, no spaces or special characters)",
//         "error"
//       );
//     }

//     await addCoupon(couponData, token)
//       .then((data) => {
//         setCoupons([...coupons, data.data._doc]);
//         setIsAddModalOpen(false);
//         showToast("Coupon added successfully", "success");
//         setCouponData({
//           couponName: "",
//           couponCode: "",
//           couponDiscount: 0,
//           expireAt: "",
//         });
//       })
//       .catch((err) => {
//         console.error("Failed to add coupon:", err);
//         showToast("Failed to add coupon", "error");
//       });
//   };

//   const handleUpdateCoupon = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     // 1. Validate that all required fields are filled
//     if (
//       couponData.couponName === "" ||
//       couponData.couponCode === "" ||
//       couponData.couponDiscount === 0 ||
//       couponData.expireAt === ""
//     ) {
//       return showToast("Please fill all the fields", "error");
//     }
//     if (couponData.couponDiscount <= 0 || couponData.couponDiscount >= 100) {
//       return showToast("Wrong Discount, try to add a correct one", "error");
//     }

//     const couponRegex = /^[A-Za-z0-9]{6,10}$/;
//     if (!couponRegex.test(couponData.couponCode)) {
//       return showToast(
//         "Please enter a valid coupon code (6-10 alphanumeric characters, no spaces or special characters)",
//         "error"
//       );
//     }
//     const changes: Partial<typeof couponData> = {};

//     if (couponData.couponName !== selectedCoupon?.couponName) {
//       changes.couponName = couponData.couponName;
//     }

//     if (couponData.couponCode !== selectedCoupon?.couponCode) {
//       changes.couponCode = couponData.couponCode;
//     }

//     if (couponData.couponDiscount !== selectedCoupon?.couponDiscount) {
//       changes.couponDiscount = couponData.couponDiscount;
//     }

//     if (
//       couponData.expireAt !==
//       (selectedCoupon?.expireAt ? selectedCoupon.expireAt.toISOString() : "")
//     ) {
//       changes.expireAt = couponData.expireAt;
//     }

//     // 5. If no fields have changed, notify the user and stop.
//     if (Object.keys(changes).length === 0) {
//       return showToast("No changes made", "error");
//     }

//     // 6. Call the updateCoupon function with only the changed fields.
//     updateCoupon(selectedCoupon?._id, changes, token)
//       .then((data) => {
//         setCoupons((prev) =>
//           prev.map((c) =>
//             c._id === selectedCoupon?._id ? { ...c, ...data.data } : c
//           )
//         );
//         setEditModal(false);
//         showToast("Coupon updated successfully", "success");
//       })
//       .catch((err) => {
//         console.error("Failed to update coupon:", err);
//         showToast("Failed to update coupon", "error");
//       });
//   };
//   const handleEditCoupon = () => {
//     setEditModal(true);
//     if (!selectedCoupon) return;
//     setCouponData({
//       couponName: selectedCoupon.couponName || "",
//       couponCode: selectedCoupon.couponCode || "",
//       couponDiscount: selectedCoupon.couponDiscount || 0,
//       // Format the date to "YYYY-MM-DDTHH:MM" for the datetime-local input:
//       expireAt: selectedCoupon.expireAt
//         ? new Date(selectedCoupon.expireAt).toISOString().substring(0, 16)
//         : "",
//     });
//   };

//   const indexOfLastCoupon = currentPage * itemsPerPage;
//   const indexOfFirstCoupon = indexOfLastCoupon - itemsPerPage;
//   const currentCoupons = coupons.slice(indexOfFirstCoupon, indexOfLastCoupon);

//   return (
//     <div className="mx-auto p-4 w-full h-screen flex justify-center bg-black">
//       <div className="bg-gray-800 h-max shadow-md rounded-lg overflow-hidden w-full mx-20">
//         <div className="p-6 bg-gray-800 border-b flex justify-between">
//           <h1 className="text-2xl font-bold text-gray-100">
//             Coupon Management
//           </h1>
//           <button
//             className="bg-purple-500 px-5 rounded-lg text-white"
//             onClick={() => setIsAddModalOpen(true)}
//           >
//             Add Coupon
//           </button>
//         </div>
//         <div className="p-6">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-gray-800 text-white">
//                 <th className="p-3 border-b">S.No</th>
//                 <th className="p-2 border-b">Coupon Name</th>
//                 <th className="p-3 border-b">Code</th>
//                 <th className="p-3 border-b">Discount</th>
//                 <th className="p-3 border-b">Start Date</th>
//                 <th className="p-3 border-b">Expiry</th>
//                 <th className="p-3 border-b">Status</th>
//                 <th className="p-3 border-b">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentCoupons.map((coupon, index) => (
//                 <tr key={index} className="text-gray-50">
//                   <td className="p-3 border-b">
//                     {indexOfFirstCoupon + index + 1}
//                   </td>
//                   <td className="p-3 border-b">{coupon.couponName}</td>
//                   <td className="p-3 border-b">{coupon.couponCode}</td>
//                   <td className="p-3 border-b">{coupon.couponDiscount}%</td>
//                   <td className="p-3 border-b">
//                     {new Date(coupon.startDate).toLocaleDateString()}
//                   </td>
//                   <td className="p-3 border-b">
//                     {new Date(coupon.expireAt).toLocaleDateString()}
//                   </td>
//                   <td className="p-3 border-b">
//                     {coupon.couponStatus ? "Active" : "Inactive"}
//                   </td>
//                   <td className="p-3 border-b">
//                     <button
//                       className="bg-yellow-500 px-3 py-1 rounded"
//                       onClick={handleEditCoupon}
//                     >
//                       Edit
//                     </button>
//                     {coupon.couponStatus ? (
//                       <button
//                         className="bg-red-500 px-3 py-1 rounded ml-2"
//                         onClick={() => handleToggleCoupon(coupon._id)}
//                       >
//                         Unlist
//                       </button>
//                     ) : (
//                       <button
//                         className="bg-green-500 px-3 py-1 rounded ml-2"
//                         onClick={() => handleToggleCoupon(coupon._id)}
//                       >
//                         List
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           <Pagination
//             totalPages={Math.ceil(coupons.length / itemsPerPage)}
//             onPageChange={setCurrentPage}
//             currentPage={currentPage}
//           />
//         </div>
//       </div>

//       {isAddModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-gray-800 p-8 rounded-lg w-96">
//             <form onSubmit={handleAddCoupon}>
//               <h2 className="text-2xl font-bold mb-4 text-white">
//                 Add New Coupon
//               </h2>
//               <input
//                 className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
//                 placeholder="Coupon Name"
//                 value={couponData.couponName}
//                 onChange={(e) =>
//                   setCouponData({ ...couponData, couponName: e.target.value })
//                 }
//               />
//               <input
//                 className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
//                 placeholder="Coupon Code"
//                 value={couponData.couponCode}
//                 onChange={(e) =>
//                   setCouponData({ ...couponData, couponCode: e.target.value })
//                 }
//               />
//               <input
//                 className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
//                 type="number"
//                 placeholder="Discount"
//                 value={couponData.couponDiscount}
//                 onChange={(e) =>
//                   setCouponData({
//                     ...couponData,
//                     couponDiscount: Number(e.target.value),
//                   })
//                 }
//               />

//               <input
//                 className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
//                 type="datetime-local"
//                 value={
//                   couponData.expireAt
//                     ? couponData.expireAt.substring(0, 16)
//                     : ""
//                 }
//                 onChange={(e) => {
//                   const selectedDateTime = new Date(e.target.value);
//                   const isoDateTime = selectedDateTime.toISOString();
//                   setCouponData({ ...couponData, expireAt: isoDateTime });
//                 }}
//               />

//               <div className="flex justify-end">
//                 <button
//                   className="bg-gray-600 text-white px-4 py-2 rounded mr-2"
//                   onClick={() => setIsAddModalOpen(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-purple-500 text-white px-4 py-2 rounded"
//                 >
//                   Add Coupon
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//       {/* Edit Coupon Modal */}
//       {editModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-gray-800 p-8 rounded-lg w-96">
//             <form onSubmit={handleUpdateCoupon}>
//               <h2 className="text-2xl font-bold mb-4 text-white">
//                 Edit Coupon
//               </h2>
//               <input
//                 className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
//                 placeholder="Coupon Name"
//                 value={couponData.couponName}
//                 onChange={(e) =>
//                   setCouponData({ ...couponData, couponName: e.target.value })
//                 }
//               />
//               <input
//                 className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
//                 placeholder="Coupon Code"
//                 value={couponData.couponCode}
//                 onChange={(e) =>
//                   setCouponData({ ...couponData, couponCode: e.target.value })
//                 }
//               />
//               <input
//                 className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
//                 type="number"
//                 placeholder="Discount"
//                 value={couponData.couponDiscount}
//                 onChange={(e) =>
//                   setCouponData({
//                     ...couponData,
//                     couponDiscount: Number(e.target.value),
//                   })
//                 }
//               />

//               <input
//                 className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
//                 type="datetime-local"
//                 value={
//                   couponData.expireAt
//                     ? couponData.expireAt.substring(0, 16)
//                     : ""
//                 }
//                 onChange={(e) => {
//                   const selectedDateTime = new Date(e.target.value);
//                   const isoDateTime = selectedDateTime.toISOString();
//                   setCouponData({ ...couponData, expireAt: isoDateTime });
//                 }}
//               />

//               <div className="flex justify-end">
//                 <button
//                   className="bg-gray-600 text-white px-4 py-2 rounded mr-2"
//                   onClick={() => setEditModal(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-purple-500 text-white px-4 py-2 rounded"
//                 >
//                   Update Coupon
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Pagination from "@/app/components/common/pagination";
import { showToast } from "@/utils/toastUtil";
import { useSelector } from "react-redux";
import {
  getCoupons,
  addCoupon,
  updateCoupon,
  toggleCoupon,
} from "@/api/coupon/coupon";

export default function CouponManagement() {
  interface Coupon {
    _id: string;
    couponName: string;
    couponCode: string;
    couponDiscount: number;
    startDate: Date;
    expireAt: Date;
    couponStatus: boolean;
  }

  const token: any = Cookies.get("jwt_token");
  const { user } = useSelector((state: any) => state.auth);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [couponData, setCouponData] = useState({
    couponName: "",
    couponCode: "",
    couponDiscount: 0,
    expireAt: "",
  });

  useEffect(() => {
    getCoupons(token)
      .then((data) => {
        setCoupons(data.data);
      })
      .catch((err) => {
        console.error("Failed to fetch coupons data:", err);
        showToast("Failed to fetch course data", "error");
      });
  }, [token]);

  const handleToggleCoupon = async (id: string) => {
    await toggleCoupon(id, token);
    setCoupons((prev) =>
      prev.map((c) =>
        c._id === id ? { ...c, couponStatus: !c.couponStatus } : c
      )
    );
  };

  const handleAddCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !couponData.couponName ||
      !couponData.couponCode ||
      !couponData.couponDiscount ||
      !couponData.expireAt
    ) {
      return showToast("Please fill all the fields", "error");
    }
    console.log(couponData);

    if (couponData.couponDiscount <= 0 || couponData.couponDiscount >= 100) {
      return showToast("Please enter a valid discount value", "error");
    }

    if (new Date(couponData.expireAt) < new Date()) {
      return showToast("Please enter a valid expiry date", "error");
    }

    const couponRegex = /^[A-Za-z0-9]{6,10}$/;
    if (!couponRegex.test(couponData.couponCode)) {
      return showToast(
        "Please enter a valid coupon code (6-10 alphanumeric characters, no spaces or special characters)",
        "error"
      );
    }

    await addCoupon(couponData, token)
      .then((data) => {
        setCoupons([...coupons, data.data._doc]);
        setIsAddModalOpen(false);
        showToast("Coupon added successfully", "success");
        setCouponData({
          couponName: "",
          couponCode: "",
          couponDiscount: 0,
          expireAt: "",
        });
      })
      .catch((err) => {
        console.error("Failed to add coupon:", err);
        showToast("Failed to add coupon", "error");
      });
  };

  const handleUpdateCoupon = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedCoupon) {
      showToast("No coupon selected for editing", "error");
      return;
    }

    // 1. Validate that all required fields are filled
    if (
      couponData.couponName === "" ||
      couponData.couponCode === "" ||
      couponData.couponDiscount === 0 ||
      couponData.expireAt === ""
    ) {
      return showToast("Please fill all the fields", "error");
    }
    if (couponData.couponDiscount <= 0 || couponData.couponDiscount >= 100) {
      return showToast("Wrong Discount, try to add a correct one", "error");
    }

    const couponRegex = /^[A-Za-z0-9]{6,10}$/;
    if (!couponRegex.test(couponData.couponCode)) {
      return showToast(
        "Please enter a valid coupon code (6-10 alphanumeric characters, no spaces or special characters)",
        "error"
      );
    }
    const changes: Partial<typeof couponData> = {};

    if (couponData.couponName !== selectedCoupon.couponName) {
      changes.couponName = couponData.couponName;
    }

    if (couponData.couponCode !== selectedCoupon.couponCode) {
      changes.couponCode = couponData.couponCode;
    }

    if (couponData.couponDiscount !== selectedCoupon.couponDiscount) {
      changes.couponDiscount = couponData.couponDiscount;
    }

    if (
      couponData.expireAt !==
      new Date(selectedCoupon.expireAt).toISOString().substring(0, 16)
    ) {
      changes.expireAt = couponData.expireAt;
    }

    // 5. If no fields have changed, notify the user and stop.
    if (Object.keys(changes).length === 0) {
      return showToast("No changes made", "error");
    }

    // 6. Call the updateCoupon function with only the changed fields.
    updateCoupon(selectedCoupon?._id, changes, token)
      .then((data) => {
        setCoupons((prev) =>
          prev.map((c) =>
            c._id === selectedCoupon?._id ? { ...c, ...data.data } : c
          )
        );
        setEditModal(false);
        showToast("Coupon updated successfully", "success");
      })
      .catch((err) => {
        console.error("Failed to update coupon:", err);
        showToast("Failed to update coupon", "error");
      });
  };
  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setEditModal(true);
    setCouponData({
      couponName: coupon.couponName || "",
      couponCode: coupon.couponCode || "",
      couponDiscount: coupon.couponDiscount || 0,
      expireAt: coupon.expireAt
        ? new Date(coupon.expireAt).toISOString().substring(0, 16)
        : "",
    });
  };

  const indexOfLastCoupon = currentPage * itemsPerPage;
  const indexOfFirstCoupon = indexOfLastCoupon - itemsPerPage;
  const currentCoupons = coupons.slice(indexOfFirstCoupon, indexOfLastCoupon);

  return (
    <div className="mx-auto p-4 w-full h-screen flex justify-center bg-black">
      <div className="bg-gray-800 h-max shadow-md rounded-lg overflow-hidden w-full mx-20">
        <div className="p-6 bg-gray-800 border-b flex justify-between">
          <h1 className="text-2xl font-bold text-gray-100">
            Coupon Management
          </h1>
          <button
            className="bg-purple-500 px-5 rounded-lg text-white"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Coupon
          </button>
        </div>
        <div className="p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="p-3 border-b">S.No</th>
                <th className="p-2 border-b">Coupon Name</th>
                <th className="p-3 border-b">Code</th>
                <th className="p-3 border-b">Discount</th>
                <th className="p-3 border-b">Start Date</th>
                <th className="p-3 border-b">Expiry</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentCoupons.map((coupon, index) => (
                <tr key={index} className="text-gray-50">
                  <td className="p-3 border-b">
                    {indexOfFirstCoupon + index + 1}
                  </td>
                  <td className="p-3 border-b">{coupon.couponName}</td>
                  <td className="p-3 border-b">{coupon.couponCode}</td>
                  <td className="p-3 border-b">{coupon.couponDiscount}%</td>
                  <td className="p-3 border-b">
                    {new Date(coupon.startDate).toLocaleDateString()}
                  </td>
                  <td className="p-3 border-b">
                    {new Date(coupon.expireAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 border-b">
                    {coupon.couponStatus ? "Active" : "Inactive"}
                  </td>
                  <td className="p-3 border-b">
                    <button
                      className="bg-yellow-500 px-3 py-1 rounded"
                      onClick={() => handleEditCoupon(coupon)}
                    >
                      Edit
                    </button>
                    {coupon.couponStatus ? (
                      <button
                        className="bg-red-500 px-3 py-1 rounded ml-2"
                        onClick={() => handleToggleCoupon(coupon._id)}
                      >
                        Unlist
                      </button>
                    ) : (
                      <button
                        className="bg-green-500 px-3 py-1 rounded ml-2"
                        onClick={() => handleToggleCoupon(coupon._id)}
                      >
                        List
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            totalPages={Math.ceil(coupons.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            currentPage={currentPage}
          />
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg w-96">
            <form onSubmit={handleAddCoupon}>
              <h2 className="text-2xl font-bold mb-4 text-white">
                Add New Coupon
              </h2>
              <input
                className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                placeholder="Coupon Name"
                value={couponData.couponName}
                onChange={(e) =>
                  setCouponData({ ...couponData, couponName: e.target.value })
                }
              />
              <input
                className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                placeholder="Coupon Code"
                value={couponData.couponCode}
                onChange={(e) =>
                  setCouponData({ ...couponData, couponCode: e.target.value })
                }
              />
              <input
                className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                type="number"
                placeholder="Discount"
                value={couponData.couponDiscount}
                onChange={(e) =>
                  setCouponData({
                    ...couponData,
                    couponDiscount: Number(e.target.value),
                  })
                }
              />

              <input
                className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                type="datetime-local"
                value={
                  couponData.expireAt
                    ? couponData.expireAt.substring(0, 16)
                    : ""
                }
                onChange={(e) => {
                  const selectedDateTime = new Date(e.target.value);
                  const isoDateTime = selectedDateTime.toISOString();
                  setCouponData({ ...couponData, expireAt: isoDateTime });
                }}
              />

              <div className="flex justify-end">
                <button
                  className="bg-gray-600 text-white px-4 py-2 rounded mr-2"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-500 text-white px-4 py-2 rounded"
                >
                  Add Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Coupon Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg w-96">
            <form onSubmit={handleUpdateCoupon}>
              <h2 className="text-2xl font-bold mb-4 text-white">
                Edit Coupon
              </h2>
              <input
                className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                placeholder="Coupon Name"
                value={couponData.couponName}
                onChange={(e) =>
                  setCouponData({ ...couponData, couponName: e.target.value })
                }
              />
              <input
                className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                placeholder="Coupon Code"
                value={couponData.couponCode}
                onChange={(e) =>
                  setCouponData({ ...couponData, couponCode: e.target.value })
                }
              />
              <input
                className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                type="number"
                placeholder="Discount"
                value={couponData.couponDiscount}
                onChange={(e) =>
                  setCouponData({
                    ...couponData,
                    couponDiscount: Number(e.target.value),
                  })
                }
              />

              <input
                className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                type="datetime-local"
                value={
                  couponData.expireAt
                    ? couponData.expireAt.substring(0, 16)
                    : ""
                }
                onChange={(e) => {
                  const selectedDateTime = new Date(e.target.value);
                  const isoDateTime = selectedDateTime.toISOString();
                  setCouponData({ ...couponData, expireAt: isoDateTime });
                }}
              />

              <div className="flex justify-end">
                <button
                  className="bg-gray-600 text-white px-4 py-2 rounded mr-2"
                  onClick={() => setEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-500 text-white px-4 py-2 rounded"
                >
                  Update Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
