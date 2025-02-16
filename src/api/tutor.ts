import { backendUrl } from "@/utils/backendUrl";
import axios from "axios";

export const getEnrollStudents = async (courseId: string, token: any) => {
  try {
    let response = await axios.get(
      `${backendUrl}/tutor/enroll-students/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error: any) {
    console.error(error);
  }
};
