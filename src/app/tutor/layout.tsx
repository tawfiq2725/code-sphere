"use client";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { loadAuthFromCookies } from "@/store/slice/authSlice";
import Sidebar from "@/app/components/Tutor/sidebar";
import { createSocket } from "@/utils/config/socket";
import { showToast } from "@/utils/toastUtil";
import api from "@/api/axios";

import { User } from "@/interface/user";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  interface Notifications {
    id: string;
    studentName: string;
    studentId: string;
    message: string;
    timestamp: Date;
    studentProfile?: string;
    read: boolean;
  }

  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, role } = useSelector((state: any) => state.auth);
  const [notifications, setNotifications] = useState<Notifications[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<any>(null);
  const [students, setStudents] = useState<User[]>([]);
  const { user } = useSelector((state: any) => state.auth);
  const tutorId = user.user._id;

  useEffect(() => {
    dispatch(loadAuthFromCookies());
    if (!isAuthenticated || role !== "tutor") {
      router.push("/auth/sign-in");
    }
  }, [dispatch, isAuthenticated, role, router]);

  // Setup socket connection
  useEffect(() => {
    if (!tutorId) return;

    const s = createSocket();
    setSocket(s);

    s.on("connect", () => {
      console.log("Socket connected in dashboard:", s.id);
      s.emit("register", { type: "tutor", id: tutorId });
    });
    s.on(
      "notification",
      (notification: {
        chatId: string;
        senderType: "student" | "tutor";
        senderId: string;
        message: string;
      }) => {
        if (notification.senderType === "student") {
          const student = students.find((s) => s._id === notification.senderId);

          if (student) {
            const newNotification: Notifications = {
              id: Date.now().toString(),
              studentName: student.name,
              studentId: student._id ?? "",
              message: notification.message,
              timestamp: new Date(),
              studentProfile: student.profile,
              read: false,
            };

            setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
            setUnreadCount((prev) => prev + 1);
            showToast(
              `New message from ${student.name}: ${notification.message}`,
              "info"
            );
          }
        }
      }
    );

    return () => {
      s.disconnect();
    };
  }, [tutorId, students]);
  useEffect(() => {
    if (!tutorId) return;

    const fetchStudents = async () => {
      try {
        const { data } = await api.get(`/tutor/get-students/${tutorId}`);
        if (data && data.data) {
          setStudents(data.data);
        }
      } catch (error) {
        console.log("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [tutorId]);

  if (!isAuthenticated || role !== "tutor") {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar unreadCount={unreadCount} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
