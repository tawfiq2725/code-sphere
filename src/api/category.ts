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

export const toggleVisiblity = async (id: string) => {
  const response = await api.patch(
    `/api/course/chapter/toggle-visibility/${id}`
  );
  return response.data;
};

export const getByNameById = async (id: string) => {
  const response = await api.get(`/api/course/get-category/${id}`);
  return response.data.data;
};

export const getAllCategories = async () => {
  const response = await api.get(`/api/course/get-category-all`);
  return response.data.data;
};
export const getAllCategoriesUser = async (id: string) => {
  const response = await api.get(`/api/course/get-category-all/${id}`);
  return response.data.data;
};
