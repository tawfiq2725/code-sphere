import { backendUrl } from "@/utils/backendUrl";
import axios from "axios";
import api from "@/api/axios";

export const getCourseData = async (token: string, id: string) => {
  const response = await axios.get(
    `${backendUrl}/api/course/get-courses/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getCourseDataByAdmin = async () => {
  const response = await api.get(`/admin/get-courses`);
  return response.data.data;
};

export const getCourses = async () => {
  const response = await axios.get(`${backendUrl}/api/course/get-course-data`);
  return response.data;
};

export const getCoursById = async (id: string) => {
  const response = await axios.get(`${backendUrl}/api/course/get-course/${id}`);
  return response.data;
};

export const findUserById = async (id: string) => {
  console.log("sharik id-------", id);
  const response = await axios.get(`${backendUrl}/api/user/find-user/${id}`);
  return response.data.data;
};

export const getChaptersById = async (id: string) => {
  const response = await axios.get(
    `${backendUrl}/api/course/get-chapter-front/${id}`
  );
  return response.data.data;
};
