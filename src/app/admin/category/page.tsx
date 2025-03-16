"use client";

import React, { useState, useEffect } from "react";
import {
  addCategory as addCategoryApi,
  getCategories as getCategoriesApi,
  updateCategory as updateCategoryApi,
} from "@/api/category";
import Cookies from "js-cookie";
import Pagination from "@/app/components/common/pagination";
import Search from "@/app/components/common/search";
import { showToast } from "@/utils/toastUtil";
import { User, Edit, Eye, EyeOff } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const token = Cookies.get("jwt_token") || "";
  const itemsPerPage = 5;
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
  }

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchCategories();
  }, [debouncedSearchTerm]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategoriesApi();
      const filteredData = searchTerm
        ? data.filter(
            (cat: Category) =>
              cat.categoryName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              cat.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : data;
      setCategories(filteredData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showToast("Failed to fetch categories", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName && !newCategoryDescription) {
      return showToast("Please fill all the fields", "error");
    }

    const categoryNameRegex = /^[A-Za-z\s]{4,40}$/;
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
        const res = await addCategoryApi({
          categoryName: newCategoryName,
          description: newCategoryDescription,
        });

        if (res.success) {
          fetchCategories();
          setNewCategoryName("");
          setNewCategoryDescription("");
          setIsAddModalOpen(false);
          showToast("Category added successfully", "success");
        }
      } catch (error) {
        console.error("Error adding category:", error);
        showToast("Failed to add category", "error");
      }
    }
  };

  const editCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) {
      return showToast("Please fill all the fields", "error");
    }
    const categoryNameRegex = /^[A-Za-z\s]{4,40}$/;
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
    try {
      let res = await updateCategoryApi(editingCategory, editingCategory._id);
      if (res.success) {
        fetchCategories();
        setIsEditModalOpen(false);
        showToast("Category updated successfully", "success");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      showToast("Failed to update category", "error");
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCategories = categories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 pt-10">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Category Management
          </h1>
          <p className="text-gray-400 mb-6">
            View and manage course categories
          </p>

          <div className="flex justify-between items-center mb-6">
            <div className="w-full max-w-md">
              <Search searchTerm={searchTerm} onSearch={setSearchTerm} />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition duration-200 shadow-lg flex items-center gap-2"
            >
              <span className="font-medium">Add Category</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <User className="h-16 w-16 text-gray-500 mb-4" />
            <p className="text-xl font-semibold text-gray-300 mb-2">
              No Categories Found
            </p>
            <p className="text-gray-400 text-center max-w-md">
              There are currently no categories available. Add your first
              category to get started.
            </p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700/70 text-gray-300 text-sm uppercase">
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      S.No
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Category Name
                    </th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Description
                    </th>

                    <th className="px-6 py-4 text-center font-semibold tracking-wider">
                      Edit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentCategories.map((category, index) => (
                    <tr
                      key={category._id}
                      className="border-b border-gray-700 hover:bg-gray-700/40 transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-white font-medium">
                        {category.categoryName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                        {category.description}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingCategory(category);
                              setIsEditModalOpen(true);
                            }}
                            className="px-3 py-1 rounded-lg font-medium text-sm bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition duration-300 inline-flex items-center gap-1"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {categories.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-800 rounded-lg shadow-2xl w-11/12 md:w-1/2 lg:w-1/3 p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Add Category
            </h2>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2 font-medium">
                Category Name
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                placeholder="Enter category name"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium">
                Description
              </label>
              <textarea
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                placeholder="Enter category description"
                rows={3}
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-gray-200 rounded-lg transition duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={addCategory}
                className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition duration-200 font-medium"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && editingCategory && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-800 rounded-lg shadow-2xl w-11/12 md:w-1/2 lg:w-1/3 p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Edit Category
            </h2>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2 font-medium">
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
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                placeholder="Enter category name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2 font-medium">
                Description
              </label>
              <textarea
                value={editingCategory.description}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    description: e.target.value,
                  })
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                placeholder="Enter category description"
                rows={3}
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-gray-200 rounded-lg transition duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={editCategory}
                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition duration-200 font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
