import { backendUrl } from "@/utils/backendUrl";
import axios from "axios";
import api from "@/api/axios";

export const getEnrollStudents = async (courseId: string, token: any) => {
  try {
    let response = await api.get(`/tutor/enroll-students/${courseId}`);

    return response.data.data;
  } catch (error: any) {
    console.error(error);
  }
};

export async function approveCertificate(
  studentId: string,
  courseId: string,
  tutorName: string,
  token: string
) {
  const response = await axios.post(
    "/api/tutor/approveCertificate",
    { studentId, courseId, tutorName },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
}

export const getCourseById = async (courseId: string) => {
  try {
    const res = await api.get(`/api/course/get-course/${courseId}`);
    return res.data.data;
  } catch (err) {
    console.log(err);
  }
};
