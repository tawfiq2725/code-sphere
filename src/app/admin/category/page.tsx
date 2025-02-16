"use client";

import { useState, useEffect } from "react";
import {
  addCategory as addCategoryApi,
  getCategories as getCategoriesApi,
  updateCategory as updateCategoryApi,
  toggleVisiblity as toggleVisibilityApi,
} from "@/api/category";
import Cookies from "js-cookie";
import Pagination from "@/app/components/common/pagination";

interface Category {
  categoryName: string;
  description: string;
  status: boolean;
  _id: string;
}

export default function Category() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const token = Cookies.get("jwt_token") || "";
  const itemsPerPage = 5;
  const totalPages = Math.ceil(categories.length / itemsPerPage);

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
        await addCategoryApi(
          {
            categoryName: newCategoryName,
            description: newCategoryDescription,
          },
          token
        );
        fetchCategories();
        setNewCategoryName("");
        setNewCategoryDescription("");
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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCategories = categories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center my-8">
          <h1 className="text-4xl font-extrabold text-gray-50 mb-2">
            Category Management
          </h1>
          <p className="text-lg text-gray-50">
            Manage your categories efficiently
          </p>
        </header>
        <div className="flex justify-end my-6">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition duration-200"
          >
            Add Category
          </button>
        </div>

        <div className="bg-gray-800 shadow rounded-lg overflow-x-auto">
          {categories.length === 0 ? (
            <p className="p-4 text-gray-50">No categories available.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-500">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Visibility
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-200">
                {currentCategories.map((category, index) => (
                  <tr key={category._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-50">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-50">
                      {category.categoryName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-50">
                      {category.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        // onClick={() => toggleCategoryListing(category._id)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full text-white transition duration-200 ${
                          category.status
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {category.status ? "Listed" : "Unlisted"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setIsEditModalOpen(true);
                        }}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium transition duration-200"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add Category Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Add Category
              </h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-indigo-500"
                  placeholder="Enter category name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Description</label>
                <textarea
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-indigo-500"
                  placeholder="Enter category description"
                  rows={3}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={addCategory}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition duration-200"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {isEditModalOpen && editingCategory && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Edit Category
              </h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={editingCategory.categoryName}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      categoryName: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                  placeholder="Enter category name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingCategory.description}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      description: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                  placeholder="Enter category description"
                  rows={3}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={editCategory}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition duration-200"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination Component */}
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
}
