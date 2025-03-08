"use client";
import Pagination from "@/app/components/common/pagination";
import Search from "@/app/components/common/search";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Plus, Pencil, ShieldOff, Shield } from "lucide-react";
import {
  addMembership,
  fetchMemberships,
  toggleStatusMembership,
  updateMembership,
} from "@/api/admin";
import { showToast } from "@/utils/toastUtil";

interface Membership {
  _id: string;
  membershipId: string;
  membershipName: string;
  membershipDescription: string;
  membershipPlan: "Basic" | "Standard" | "Premium";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [editedFields, setEditedFields] = useState<Partial<Membership>>({});
  const [newMembership, setNewMembership] = useState({
    membershipName: "",
    membershipDescription: "",
    membershipPlan: "Basic" as "Basic" | "Standard" | "Premium",
    price: 0,
    label: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const token = Cookies.get("jwt_token") || "";

  useEffect(() => {
    setIsLoading(true);
    fetchMemberships()
      .then((data) => {
        setMemberships(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch memberships:", err);
        showToast("Failed to fetch memberships", "error");
        setIsLoading(false);
      });
  }, [token]);

  // Filtering logic
  const filteredMemberships = memberships.filter(
    (membership) =>
      membership.membershipName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      membership.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMembership = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !newMembership.membershipName ||
      !newMembership.membershipDescription ||
      !newMembership.membershipPlan ||
      !newMembership.label
    ) {
      return showToast("Please fill all the required fields", "error");
    }

    if (newMembership.price < 0) {
      return showToast("Price cannot be negative", "error");
    }

    // Directly pass the newMembership data as the schema expects a string for membershipDescription
    const membershipData = { ...newMembership };

    addMembership(membershipData)
      .then((data) => {
        setMemberships([...memberships, data]);
        showToast("Membership added successfully", "success");
        setIsAddModalOpen(false);
        setNewMembership({
          membershipName: "",
          membershipDescription: "",
          membershipPlan: "Basic",
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

    updateMembership(updateData.membershipId, updateData)
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

  const handleToggleStatus = (id: string) => {
    const membership = memberships.find((m) => m.membershipId === id);
    if (!membership) return;

    toggleStatusMembership(id)
      .then((data: any) => {
        setMemberships(
          memberships.map((membership) =>
            membership._id === data._id ? data : membership
          )
        );
        showToast(
          `Membership ${
            data.status ? "activated" : "deactivated"
          } successfully`,
          "success"
        );
      })
      .catch((err: any) => {
        console.error("Failed to update status:", err);
        showToast("Failed to update status", "error");
      });
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditedFields({});
    setEditingMembership(null);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMemberships.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 pt-10">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Membership Management
          </h1>
          <p className="text-gray-400">View and manage membership plans</p>

          <div className="flex justify-between items-center mb-4">
            <div className="w-full max-w-md">
              <Search searchTerm={searchTerm} onSearch={setSearchTerm} />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
            >
              <Plus className="mr-2" size={20} /> Add Membership
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : currentItems.length > 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700/70 text-gray-300 text-sm uppercase">
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      S.No
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Membership ID
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Label
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((membership, index) => (
                    <tr
                      key={membership._id}
                      className="border-b border-gray-700 hover:bg-gray-700/40 transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                        {index + 1 + (currentPage - 1) * itemsPerPage}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                        {membership.membershipId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white font-medium">
                        {membership.membershipName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                        {membership.label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                        {membership.membershipPlan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                        ₹{membership.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {membership.status ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">
                            <ShieldOff size={14} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm">
                            <Shield size={14} />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingMembership(membership);
                              setIsEditModalOpen(true);
                            }}
                            className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-3 py-1.5 rounded-lg"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleStatus(membership.membershipId)
                            }
                            className={`px-3 py-1.5 rounded-lg font-medium transition duration-300 inline-flex items-center gap-2 ${
                              membership.status
                                ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                            }`}
                          >
                            {membership.status ? (
                              <>
                                <Shield size={16} />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ShieldOff size={16} />
                                Activate
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 px-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <Pencil className="h-16 w-16 text-gray-500 mb-4" />
            <p className="text-xl font-semibold text-gray-300 mb-2">
              No Memberships Found
            </p>
            <p className="text-gray-400 text-center max-w-md">
              There are currently no membership plans matching your search
              criteria.
            </p>
          </div>
        )}

        {filteredMemberships.length > itemsPerPage && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredMemberships.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Add Membership Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md border border-gray-700 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Add New Membership
            </h2>
            <form onSubmit={handleAddMembership}>
              <input
                type="text"
                placeholder="Name"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 transition"
                value={newMembership.membershipName}
                onChange={(e) =>
                  setNewMembership({
                    ...newMembership,
                    membershipName: e.target.value,
                  })
                }
              />
              <textarea
                placeholder="Description"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 transition"
                value={newMembership.membershipDescription}
                onChange={(e) =>
                  setNewMembership({
                    ...newMembership,
                    membershipDescription: e.target.value,
                  })
                }
              />
              <select
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 transition"
                value={newMembership.membershipPlan}
                onChange={(e) =>
                  setNewMembership({
                    ...newMembership,
                    membershipPlan: e.target.value as
                      | "Basic"
                      | "Standard"
                      | "Premium",
                  })
                }
              >
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
              <input
                type="text"
                placeholder="Label"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 transition"
                value={newMembership.label}
                onChange={(e) =>
                  setNewMembership({ ...newMembership, label: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Price"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 transition"
                value={newMembership.price}
                onChange={(e) =>
                  setNewMembership({
                    ...newMembership,
                    price: Number(e.target.value),
                  })
                }
              />

              <div className="flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  Add Membership
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Membership Modal */}
      {isEditModalOpen && editingMembership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md border border-gray-700 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Edit Membership
            </h2>
            <form onSubmit={handleEditMembership}>
              <input
                type="text"
                placeholder="Membership ID"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded border border-gray-600 cursor-not-allowed opacity-70"
                defaultValue={editingMembership.membershipId}
                readOnly
              />
              <input
                type="text"
                placeholder="Name"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 transition"
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
              <textarea
                placeholder="Description"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 transition"
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
              <select
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 transition"
                defaultValue={editingMembership.membershipPlan}
                onChange={(e) => {
                  const newValue = e.target.value as
                    | "Basic"
                    | "Standard"
                    | "Premium";
                  if (newValue !== editingMembership.membershipPlan) {
                    setEditedFields((prev) => ({
                      ...prev,
                      membershipPlan: newValue,
                    }));
                  } else {
                    const { membershipPlan, ...rest } = editedFields;
                    setEditedFields(rest);
                  }
                }}
              >
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
              <input
                type="text"
                placeholder="Label"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 transition"
                defaultValue={editingMembership.label}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue !== editingMembership.label) {
                    setEditedFields((prev) => ({ ...prev, label: newValue }));
                  } else {
                    const { label, ...rest } = editedFields;
                    setEditedFields(rest);
                  }
                }}
              />
              <input
                type="number"
                placeholder="Price"
                className="w-full p-2 mb-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 transition"
                defaultValue={editingMembership.price}
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  if (newValue !== editingMembership.price) {
                    setEditedFields((prev) => ({ ...prev, price: newValue }));
                  } else {
                    const { price, ...rest } = editedFields;
                    setEditedFields(rest);
                  }
                }}
              />

              <div className="flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  Update Membership
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
