export interface User {
  name: string;
  email: string;
  password: string;
  role: "student" | "tutor" | "admin";
  _id?: string;
  isVerified: boolean;
  isAdmin: boolean;
  isBlocked: boolean;
  googleId?: string;
  isTutor: boolean;
  qualification?: string;
  experience?: number;
  subjects?: string[];
  certificates?: string[];
  tutorStatus?: "pending" | "approved" | "rejected";
  profile?: string;
  bio?: string;
  hasNewMessage?: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface Message {
  _id: string;
  message: string;
  sender: "student" | "tutor";
  timestamp: string;
  createdAt: string;
}
