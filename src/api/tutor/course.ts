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
