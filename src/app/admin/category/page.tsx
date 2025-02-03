"use client";

import { useState, useEffect } from "react";
import {
  addCategory as addCategoryApi,
  getCategories as getCategoriesApi,
  updateCategory as updateCategoryApi,
  toggleVisiblity as toggleVisibilityApi,
} from "@/api/category";
import Cookies from "js-cookie";

interface Category {
  categoryName: string;
  status: boolean;
  _id: string;
}

export default function Category() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category>();
  const token = Cookies.get("jwt_token") || "";
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategoriesApi(token);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const addCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        await addCategoryApi({ categoryName: newCategoryName }, token);
        fetchCategories();
        setNewCategoryName("");
        setIsAddModalOpen(false);
      } catch (error) {
        console.error("Error adding category:", error);
      }
    }
  };

  const editCategory = async () => {
    if (editingCategory && editingCategory.categoryName.trim()) {
      try {
        await updateCategoryApi(editingCategory, token, editingCategory._id);
        fetchCategories();
        setIsEditModalOpen(false);
      } catch (error) {
        console.error("Error updating category:", error);
      }
    }
  };

  const toggleCategoryListing = async (id: string) => {
    try {
      await toggleVisibilityApi(id, token);
      fetchCategories();
    } catch (error) {
      console.error("Error toggling category visibility:", error);
    }
  };

  return (
    <div className="w-full min-h-screen p-8 bg-black flex justify-center items-center flex-col">
      <h1 className="text-3xl font-bold mb-6 text-white">
        Category Management
      </h1>

      {categories.length === 0 ? (
        <p className="text-gray-500 mb-4">No categories available.</p>
      ) : (
        <table className="w-full bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-2 px-4 text-left text-white">S.No</th>
              <th className="py-2 px-4 text-left text-white">Category Name</th>
              <th className="py-2 px-4 text-left text-white">Visibility</th>
              <th className="py-2 px-4 text-left text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr key={category._id} className="border-b">
                <td className="py-2 px-4 text-white">{index + 1}</td>
                <td className="py-2 px-4 text-white">
                  {category.categoryName}
                </td>
                <td className="py-2 px-4 text-white">
                  <button
                    onClick={() => toggleCategoryListing(category._id)}
                    className={`px-2 py-1 rounded ${
                      category.status ? "bg-green-500" : "bg-red-500"
                    } text-white`}
                  >
                    {category.status ? "Listed" : "Unlisted"}
                  </button>
                </td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setIsEditModalOpen(true);
                    }}
                    className="mr-2 px-2 py-1 bg-blue-500 text-white rounded"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={() => setIsAddModalOpen(true)}
        className="mt-4 px-4 py-2 bg-purple-500 text-white rounded"
      >
        Add Category
      </button>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Add Category</h2>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-4"
              placeholder="Category Name"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="mr-2 px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={addCategory}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Edit Category</h2>
            <input
              type="text"
              value={editingCategory.categoryName}
              onChange={(e) =>
                setEditingCategory({
                  ...editingCategory,
                  categoryName: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded mb-4"
              placeholder="Category Name"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="mr-2 px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={editCategory}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
