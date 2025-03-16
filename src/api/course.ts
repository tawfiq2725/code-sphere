import api from "@/api/axios";

export const getCourseData = async (id: string) => {
  const response = await api.get(`/api/course/get-courses/${id}`);

  return response.data;
};

export const getCourseDataByAdmin = async () => {
  const response = await api.get(`/admin/get-courses`);
  return response.data.data;
};

export const getCourses = async () => {
  const response = await api.get(`/api/course/get-course-data`);
  return response.data;
};

export const getCoursById = async (id: string) => {
  const response = await api.get(`/api/course/get-course/${id}`);
  return response.data;
};

export const findUserById = async (id: string) => {
  console.log("sharik id-------", id);
  const response = await api.get(`/api/user/find-user/${id}`);
  return response.data.data;
};

export const getChaptersById = async (id: string) => {
  const response = await api.get(`/api/course/get-chapter-front/${id}`);
  return response.data.data;
};
