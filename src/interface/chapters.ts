// src/types/chapter.ts
export interface Chapter {
  _id: string;
  courseId: string;
  chapterName: string;
  video: string;
  completed: boolean;
}
