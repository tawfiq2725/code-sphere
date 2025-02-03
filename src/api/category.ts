import { backendUrl } from "@/utils/backendUrl";
import axios from "axios";

interface Category {
  categoryName: string;
  _id?: string;
}

export const addCategory = async (category: Category, token: string) => {
  const response = await axios.post(
    `${backendUrl}/api/course/add-category`,
    category,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getCategories = async (token: string) => {
  const response = await axios.get(`${backendUrl}/api/course/get-categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
};
export const updateCategory = async (
  category: Category,
  token: string,
  id: string
) => {
  const response = await axios.patch(
    `${backendUrl}/api/course/update-category/${id}`,
    category,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
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
  const response = await axios.get(
    `${backendUrl}/api/course/get-category/${id}`
  );
  return response.data.data;
};

export const getAllCategories = async () => {
  const response = await axios.get(`${backendUrl}/api/course/get-category-all`);
  return response.data.data;
};
