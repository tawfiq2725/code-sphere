"use client";

import React, { useState, useEffect } from "react";
import {
  addCategory as addCategoryApi,
  getCategories as getCategoriesApi,
  updateCategory as updateCategoryApi,
  toggleVisiblity as toggleVisibilityApi,
} from "@/api/category";
import Cookies from "js-cookie";
import Pagination from "@/app/components/common/pagination";
import { showToast } from "@/utils/toastUtil";

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

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName && !newCategoryDescription) {
      return showToast("Please fill all the fields", "error");
    }

    const categoryNameRegex = /^[A-Za-z]{4,40}$/;
    const descriptionRegex = /^[A-Za-z\s,.']{10,200}$/;

    if (
      !categoryNameRegex.test(newCategoryName) ||
      !descriptionRegex.test(newCategoryDescription)
    ) {
      return showToast(
        "Category name must be 4-40 letters. Description must be 10-200 characters including letters, spaces, commas, periods.",
        "error"
      );
    }

    if (newCategoryName.trim()) {
      try {
        const res = await addCategoryApi(
          {
            categoryName: newCategoryName,
            description: newCategoryDescription,
          },
          token
        );

        if (res.success) {
          fetchCategories();
          setNewCategoryName("");
          setNewCategoryDescription("");
          setIsAddModalOpen(false);
          showToast("Category added successfully", "success");
        }
      } catch (error) {
        console.error("Error adding category:", error);
      }
    }
  };

  const editCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) {
      return showToast("Please fill all the fields", "error");
    }
    const categoryNameRegex = /^[A-Za-z]{4,40}$/;
    const descriptionRegex = /^[A-Za-z\s,.']{10,200}$/;

    if (
      !editingCategory?.categoryName ||
      !categoryNameRegex.test(editingCategory.categoryName) ||
      !editingCategory?.description ||
      !descriptionRegex.test(editingCategory.description)
    ) {
      return showToast(
        "Category name must be 4-40 letters. Description must be 10-200 characters including letters, spaces, commas, periods.",
        "error"
      );
    }
    if (editingCategory && editingCategory.categoryName.trim()) {
      try {
        let res = await updateCategoryApi(
          editingCategory,
          token,
          editingCategory._id
        );
        console.log("Response:", res);
        if (res.success) {
          fetchCategories();
          setIsEditModalOpen(false);
          showToast("Category updated successfully", "success");
        }
      } catch (error) {
        console.error("Error updating category:", error);
      }
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCategories = categories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="bg-black container mx-auto p-4 flex flex-col min-h-screen">
      <h1 className="text-3xl text-white font-bold text-center mb-8">
        Category Management
      </h1>

      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition duration-200"
        >
          Add Category
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden mx-20">
        {categories.length === 0 ? (
          <p className="p-4 text-white text-center">No categories available.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-700 text-white">
              <tr>
                <th className="pl-10 py-3 text-left">S.No</th>
                <th className="p-3 text-center">Category Name</th>
                <th className="p-3 text-center">Description</th>
                <th className="p-3 text-center">Visibility</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCategories.map((category, index) => (
                <tr
                  key={category._id}
                  className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                >
                  <td className="pl-10 py-4 whitespace-nowrap text-white">
                    {startIndex + index + 1}
                  </td>
                  <td className="p-3 whitespace-nowrap text-white">
                    {category.categoryName}
                  </td>
                  <td className="p-3 whitespace-nowrap text-white">
                    {category.description}
                  </td>
                  <td className="p-3 whitespace-nowrap text-center">
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
                  <td className="p-3 whitespace-nowrap text-center">
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
              <label className="block text-gray-700 mb-1">Category Name</label>
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
              <label className="block text-gray-700 mb-1">Category Name</label>
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
      <div className="mt-6 mx-20">
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
