"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Plus, Pencil } from "lucide-react";
import { addMembership, fetchMemberships, updateMembership } from "@/api/admin";
import { showToast } from "@/utils/toastUtil";

interface Membership {
  _id: string;
  membershipId: string;
  membershipName: string;
  membershipDescription: string;
  price: number;
  label: string;
  status: boolean;
}

export default function MembershipManagement() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(
    null
  );
  const [editedFields, setEditedFields] = useState<Partial<Membership>>({});
  const [newMembership, setNewMembership] = useState({
    membershipName: "",
    membershipDescription: "",
    price: 0,
    label: "",
  });

  const token = Cookies.get("jwt_token") || "";

  useEffect(() => {
    fetchMemberships(token)
      .then((data) => {
        console.log(data);
        setMemberships(data);
      })
      .catch((err) => {
        console.error("Failed to fetch memberships:", err);
        showToast("Failed to fetch memberships", "error");
      });
  }, [token]);

  const handleAddMembership = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(newMembership);

    addMembership(token, newMembership)
      .then((data) => {
        console.log(data);
        setMemberships([...memberships, data]);
        showToast("Membership added successfully", "success");
        setIsAddModalOpen(false);
        setNewMembership({
          membershipName: "",
          membershipDescription: "",
          price: 0,
          label: "",
        });
      })
      .catch((err) => {
        console.error("Failed to add membership:", err);
        showToast("Failed to add membership", "error");
      });
  };

  const handleEditMembership = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editingMembership) return;

    if (Object.keys(editedFields).length === 0) {
      showToast("No changes made", "info");
      setIsEditModalOpen(false);
      return;
    }

    const updateData = {
      membershipId: editingMembership.membershipId,
      ...editedFields,
    };

    updateMembership(token, updateData.membershipId, updateData)
      .then((data: any) => {
        setMemberships(
          memberships.map((membership) =>
            membership._id === data._id ? data : membership
          )
        );
        showToast("Membership updated successfully", "success");
        closeEditModal();
      })
      .catch((err: any) => {
        console.error("Failed to update membership:", err);
        showToast("Failed to update membership", "error");
      });
  };

  //   const handleToggleStatus = (id: string) => {
  //     const membership = memberships.find((m) => m._id === id);
  //     if (!membership) return;

  //     const updateData = {
  //       membershipId: id,
  //       status: !membership.status,
  //     };

  //     updateMembership(token,updateData. ,updateData)
  //       .then((data: any) => {
  //         setMemberships(
  //           memberships.map((membership) =>
  //             membership._id === data._id ? data : membership
  //           )
  //         );
  //         showToast(
  //           `Membership ${
  //             data.status ? "activated" : "deactivated"
  //           } successfully`,
  //           "success"
  //         );
  //       })
  //       .catch((err: any) => {
  //         console.error("Failed to update status:", err);
  //         showToast("Failed to update status", "error");
  //       });
  //   };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditedFields({});
    setEditingMembership(null);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Membership Management
        </h1>

        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <Plus className="mr-2" size={20} /> Add Membership
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-700 px-4 py-2">S.no</th>
                <th className="border border-gray-700 px-4 py-2">
                  Membership ID
                </th>
                <th className="border border-gray-700 px-4 py-2">Name</th>
                <th className="border border-gray-700 px-4 py-2">Label</th>
                <th className="border border-gray-700 px-4 py-2">Price</th>
                <th className="border border-gray-700 px-4 py-2">Status</th>
                <th className="border border-gray-700 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((membership, index) => (
                <tr key={membership._id} className="hover:bg-gray-900">
                  <td className="border border-gray-700 px-4 py-2">
                    {index + 1}
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    {membership.membershipId}
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    {membership.membershipName}
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    {membership.label}
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    ₹{membership.price}
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    <button
                      //   onClick={() => handleToggleStatus(membership._id)}
                      className={`px-2 py-1 rounded ${
                        membership.status ? "bg-green-600" : "bg-red-600"
                      }`}
                    >
                      {membership.status ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    <button
                      onClick={() => {
                        setEditingMembership(membership);
                        setIsEditModalOpen(true);
                      }}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add New Membership</h2>
            <form onSubmit={handleAddMembership}>
              <input
                type="text"
                placeholder="Name"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
                value={newMembership.membershipName}
                onChange={(e) =>
                  setNewMembership({
                    ...newMembership,
                    membershipName: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Description"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
                value={newMembership.membershipDescription}
                onChange={(e) =>
                  setNewMembership({
                    ...newMembership,
                    membershipDescription: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Label"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
                value={newMembership.label}
                onChange={(e) =>
                  setNewMembership({ ...newMembership, label: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Price"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
                value={newMembership.price}
                onChange={(e) =>
                  setNewMembership({
                    ...newMembership,
                    price: Number(e.target.value),
                  })
                }
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingMembership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Membership</h2>
            <form onSubmit={handleEditMembership}>
              <input
                type="text"
                placeholder="Membership ID"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
                defaultValue={editingMembership.membershipId}
                readOnly
              />

              <input
                type="text"
                placeholder="Name"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
                defaultValue={editingMembership.membershipName}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue !== editingMembership.membershipName) {
                    setEditedFields((prev) => ({
                      ...prev,
                      membershipName: newValue,
                    }));
                  } else {
                    const { membershipName, ...rest } = editedFields;
                    setEditedFields(rest);
                  }
                }}
              />

              <input
                type="text"
                placeholder="Description"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
                defaultValue={editingMembership.membershipDescription}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue !== editingMembership.membershipDescription) {
                    setEditedFields((prev) => ({
                      ...prev,
                      membershipDescription: newValue,
                    }));
                  } else {
                    const { membershipDescription, ...rest } = editedFields;
                    setEditedFields(rest);
                  }
                }}
              />

              <input
                type="text"
                placeholder="Label"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
                defaultValue={editingMembership.label}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue !== editingMembership.label) {
                    setEditedFields((prev) => ({
                      ...prev,
                      label: newValue,
                    }));
                  } else {
                    const { label, ...rest } = editedFields;
                    setEditedFields(rest);
                  }
                }}
              />

              <input
                type="number"
                placeholder="Price"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
                defaultValue={editingMembership.price}
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  if (newValue !== editingMembership.price) {
                    setEditedFields((prev) => ({
                      ...prev,
                      price: newValue,
                    }));
                  } else {
                    const { price, ...rest } = editedFields;
                    setEditedFields(rest);
                  }
                }}
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
