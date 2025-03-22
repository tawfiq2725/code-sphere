"use client";
import Sidebar from "@/app/components/User/Sidebar";
import { User } from "@/interface/user";
import { createSocket } from "@/utils/config/socket";
import { showToast } from "@/utils/toastUtil";
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import api from "@/api/axios";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  interface Notifications {
    id: string;
    tutorName: string;
    tutorId: string;
    message: string;
    timestamp: Date;
    studentProfile?: string;
    read: boolean;
  }

  const [tutors, setTutors] = useState<User[]>([]);
  const { user } = useSelector((state: any) => state.auth);
  const [socket, setSocket] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notifications[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const studentId = user?.user?._id;

  // Callback to handle message visit
  const handleMessageVisit = useCallback(() => {
    setUnreadCount(0);
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  }, []);

  useEffect(() => {
    if (!studentId) return;

    const s = createSocket();
    setSocket(s);

    s.on("connect", () => {
      console.log("Socket connected in dashboard:", s.id);
      s.emit("register", { type: "student", id: studentId });
    });

    s.on(
      "notification",
      (notification: {
        chatId: string;
        senderType: "student" | "tutor";
        senderId: string;
        message: string;
      }) => {
        if (notification.senderType === "tutor") {
          const tutor = tutors.find((s) => s._id === notification.senderId);

          if (tutor) {
            const newNotification: Notifications = {
              id: Date.now().toString(),
              tutorName: tutor.name,
              tutorId: tutor._id ?? "",
              message: notification.message,
              timestamp: new Date(),
              studentProfile: tutor.profile,
              read: false,
            };

            setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
            setUnreadCount((prev) => prev + 1);
            showToast(
              `New message from ${tutor.name}: ${notification.message}`,
              "info"
            );
          }
        }
      }
    );

    return () => {
      s.disconnect();
    };
  }, [studentId, tutors]);

  useEffect(() => {
    if (!studentId) return;

    const fetchTutors = async () => {
      try {
        const { data } = await api.get(`/student/tutor/${studentId}`);
        if (data && data.data) {
          setTutors(data.data);
        }
      } catch (error) {
        console.log("Error fetching tutors:", error);
      }
    };

    fetchTutors();
  }, [studentId]);

  return (
    <div className="flex min-h-screen">
      <Sidebar unreadCount={unreadCount} onMessageVisit={handleMessageVisit} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
