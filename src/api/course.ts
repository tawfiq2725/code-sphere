import { backendUrl } from "@/utils/backendUrl";
import axios from "axios";

// get the course
export const getCourseData = async (token: string) => {
  const response = await axios.get(`${backendUrl}/api/course/get-courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
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
