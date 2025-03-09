import { backendUrl } from "@/utils/backendUrl";
import axios from "axios";
import api from "@/api/axios";

export const getEnrollStudents = async (courseId: string) => {
  try {
    let response = await api.get(`/tutor/enroll-students/${courseId}`);

    return response.data.data;
  } catch (error: any) {
    console.error(error);
  }
};

export async function approveCertificate(data: any) {
  const response = await api.post("/tutor/api/approve-certificate", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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

// export const approveCertificate = async()=>{
//   try {
//     const res = await api.post(`/api/tutor/approveCertificate`, {studentId, courseId, tutorName});
//     return res.data.data;
//   } catch (err) {
//     console.log(err);
//   }
// }
