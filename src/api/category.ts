import { backendUrl } from "@/utils/backendUrl";
import axios from "axios";
import api from "@/api/axios";

interface Category {
  categoryName: string;
  description: string;
  _id?: string;
}

export const addCategory = async (category: Category) => {
  const response = await api.post(`/api/course/add-category`, category);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get(`/api/course/get-categories`);
  return response.data.data;
};
export const updateCategory = async (category: Category, id: string) => {
  const response = await api.patch(
    `/api/course/update-category/${id}`,
    category
  );
  return response.data;
};

export const toggleVisiblity = async (id: string, token: string) => {
  console.log("Token:", token);

  const response = await axios.patch(
    `${backendUrl}/api/course/chapter/toggle-visibility/${id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getByNameById = async (id: string) => {
  const response = await api.get(`/api/course/get-category/${id}`);
  return response.data.data;
};

export const getAllCategories = async () => {
  const response = await axios.get(`${backendUrl}/api/course/get-category-all`);
  return response.data.data;
};
