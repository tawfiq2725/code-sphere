import api from "@/api/axios";
import { signedUrltoNormalUrl } from "@/utils/presignedUrl";

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
export const getCourseReviwes = async (id: string) => {
  const response = await api.get(`/api/course/get/review/open/${id}`);
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

export const updateChapters = async (
  userId: string,
  courseId: string,
  chapterId: string
) => {
  const response = await api.patch("/api/course/update-progress", {
    userId,
    courseId,
    chapterId,
  });
  return response.data;
};

export const userGetsByCourse = async (userId: string) => {
  try {
    const updateUser = await api.get(`/api/user/find-user/${userId}`);
    updateUser.data.data.profile = signedUrltoNormalUrl(
      updateUser.data.data.profile
    );
    const userData = await updateUser.data;
    return userData;
  } catch (err) {
    console.log(err);
  }
};
