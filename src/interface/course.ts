export interface Course {
  courseId: string;
  courseName: string;
  courseDescription: string;
  info: string;
  price: number;
  prerequisites: string;
  thumbnail: string;
  isVisible: boolean;
  tutorId: string;
  courseStatus: "pending" | "approved" | "rejected";
  categoryName: string;
  sellingPrice?: number;
}
