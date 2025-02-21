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

export const getCourseById = async (courseId: string, token: any) => {
  try {
    const res = await axios.get(
      `${backendUrl}/api/course/get-course/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data.data;
  } catch (err) {
    console.log(err);
  }
};
