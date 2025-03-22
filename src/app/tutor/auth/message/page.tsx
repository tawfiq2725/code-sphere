"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  ArrowLeft,
  MessageSquare,
  Bell,
  ArrowDownAZ,
  ArrowUpZA,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Socket } from "socket.io-client";
import { Message, User } from "@/interface/user";
import { useSelector } from "react-redux";
import api from "@/api/axios";
import { createSocket } from "@/utils/config/socket";
import Image from "next/image";
import { showToast } from "@/utils/toastUtil";
import { signedUrltoNormalUrl } from "@/utils/presignedUrl";

export default function TutorChat() {
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const { user } = useSelector((state: any) => state.auth);
  const [chatId, setChatId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sortOption, setSortOption] = useState<string>("recent"); // Default sorting by recent messages

  const storedUserId = user.user._id;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  // Initialize socket connection
  useEffect(() => {
    const s = createSocket();
    setSocket(s);

    s.on("connect", () => {
      console.log("Socket connected:", s.id);
    });

    s.on("chat:history", (chat: any) => {
      if (
        chat &&
        chat._id &&
        selectedStudent &&
        String(chat.userId) === selectedStudent._id
      ) {
        setChatId(chat._id);
        setCurrentMessages(chat.messages || []);
      }
    });

    s.on("message:receive", (message: Message & { userId?: string }) => {
      console.log("New message received:", message);
      setCurrentMessages((prev) => {
        if (prev.some((msg) => msg._id === message._id)) return prev;
        return [...prev, message];
      });
      // Update last message and time in student list
      if (message.userId) {
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student._id === message.userId
              ? {
                  ...student,
                  lastMessage: message.message,
                  lastMessageTime: message.createdAt,
                }
              : student
          )
        );
      } else if (selectedStudent) {
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student._id === selectedStudent._id
              ? {
                  ...student,
                  lastMessage: message.message,
                  lastMessageTime: message.createdAt,
                }
              : student
          )
        );
      }
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
          setStudents((prevStudents) =>
            prevStudents.map((student) =>
              student._id === notification.senderId
                ? { ...student, hasNewMessage: true }
                : student
            )
          );
        }
      }
    );

    return () => {
      s.disconnect();
    };
  }, [selectedStudent]);

  // Register tutor with socket
  useEffect(() => {
    if (socket && storedUserId) {
      socket.emit("register", { type: "tutor", id: storedUserId });
    }
  }, [socket, storedUserId]);

  // Fetch students and recent messages
  useEffect(() => {
    const fetchStudentsAndMessages = async () => {
      try {
        // Fetch students
        const { data: studentData } = await api.get(
          `/tutor/get-students/${storedUserId}`
        );
        let updatedStudents = studentData.data;

        // Fetch recent messages
        const { data: recentData } = await api.get(
          `/get-recent/tutor/${storedUserId}`
        );
        const recents = recentData.data;

        // Merge recent message data with students
        updatedStudents = updatedStudents.map((student: User) => {
          const recent = recents.find((r: any) => r.studentId === student._id);
          if (recent) {
            return {
              ...student,
              chatId: recent.chatId,
              lastMessage: recent.latestMessage,
              lastMessageTime: recent.latestMessageTime,
            };
          }
          return student;
        });

        setStudents(updatedStudents);
      } catch (error) {
        console.error("Error fetching students or recent messages:", error);
      }
    };

    if (storedUserId) {
      fetchStudentsAndMessages();
    }
  }, [storedUserId]);

  // Convert signed URLs for student profiles
  for (const student of students) {
    if (student.profile)
      student.profile = signedUrltoNormalUrl(student.profile);
  }

  // Handle chat joining when a student is selected
  useEffect(() => {
    if (socket && selectedStudent && storedUserId) {
      if (chatId) {
        socket.emit("leave", chatId);
      }
      setChatId(null);
      setCurrentMessages([]);
      socket.emit("join:chat", {
        userId: selectedStudent._id,
        tutorId: storedUserId,
      });

      // Reset new message notification for selected student
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student._id === selectedStudent._id
            ? { ...student, hasNewMessage: false }
            : student
        )
      );
    }
  }, [selectedStudent, socket, storedUserId]);

  // Handle student selection
  const handleStudentSelect = (student: User) => {
    setSelectedStudent(student);
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (selectedStudent?.isBlocked) {
      return showToast(
        "The student has been blocked now and you can't send messages to him/her. Contact admin.",
        "error"
      );
    }
    if (!inputMessage.trim() || !selectedStudent || !chatId || !socket) return;
    socket.emit("message:send", {
      chatId,
      userId: selectedStudent._id,
      tutorId: storedUserId,
      sender: "tutor",
      message: inputMessage,
      type: "txt",
    });

    // Update last message and time for the selected student
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student._id === selectedStudent._id
          ? {
              ...student,
              lastMessage: inputMessage,
              lastMessageTime: new Date().toISOString(),
            }
          : student
      )
    );

    setInputMessage("");
  };

  // Sorting logic for students
  const getSortedStudents = () => {
    const studentsCopy = [...students];

    switch (sortOption) {
      case "az":
        return studentsCopy.sort((a, b) => a.name.localeCompare(b.name));
      case "za":
        return studentsCopy.sort((a, b) => b.name.localeCompare(a.name));
      case "recent":
        return studentsCopy.sort((a, b) => {
          const dateA = a.lastMessageTime
            ? new Date(a.lastMessageTime).getTime()
            : 0;
          const dateB = b.lastMessageTime
            ? new Date(b.lastMessageTime).getTime()
            : 0;
          return dateB - dateA; // Most recent first
        });
      default:
        return studentsCopy;
    }
  };

  const sortedStudents = getSortedStudents();

  return (
    <div className="flex h-screen bg-black items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-6xl h-[90vh] bg-gray-950 rounded-xl shadow-2xl overflow-hidden border border-purple-800">
        <div className="w-full md:w-1/3 border-r border-purple-900 flex flex-col">
          <div className="bg-purple-800 p-4 shadow-xl h-20 flex items-center justify-between">
            <h2 className="text-white text-lg font-bold tracking-wide">
              Messages
            </h2>
            <div className="bg-purple-700 px-3 py-1 rounded-full text-xs text-white font-medium">
              {students.length} Students
            </div>
          </div>

          {/* Sorting Buttons */}
          <div className="bg-gray-900 p-2 flex items-center justify-between border-b border-purple-900">
            <div className="text-white text-sm">Sort by:</div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSortOption("az")}
                className={`p-2 rounded-md ${
                  sortOption === "az" ? "bg-purple-700" : "bg-gray-800"
                } text-white flex items-center`}
              >
                <ArrowDownAZ size={16} className="mr-1" />
                <span className="text-xs">A-Z</span>
              </button>
              <button
                onClick={() => setSortOption("za")}
                className={`p-2 rounded-md ${
                  sortOption === "za" ? "bg-purple-700" : "bg-gray-800"
                } text-white flex items-center`}
              >
                <ArrowUpZA size={16} className="mr-1" />
                <span className="text-xs">Z-A</span>
              </button>
              <button
                onClick={() => setSortOption("recent")}
                className={`p-2 rounded-md ${
                  sortOption === "recent" ? "bg-purple-700" : "bg-gray-800"
                } text-white flex items-center`}
              >
                <Clock size={16} className="mr-1" />
                <span className="text-xs">Recent</span>
              </button>
            </div>
          </div>

          {/* Student List */}
          <div className="custom-scrollbar flex-1 overflow-y-auto bg-gray-950 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-900">
            {sortedStudents.map((student) => (
              <div
                key={student._id}
                className={`p-4 border-b border-gray-800 hover:bg-gray-900 cursor-pointer transition-all duration-200 ${
                  selectedStudent?._id === student._id
                    ? "bg-gray-900 border-l-4 border-l-purple-600"
                    : ""
                }`}
                onClick={() => handleStudentSelect(student)}
              >
                <div className="flex items-center space-x-3 relative">
                  <div className="relative">
                    <Image
                      src={student.profile || "/default-profile.jpg"}
                      alt={student.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-500 shadow-md"
                      priority
                    />
                    {student.hasNewMessage && (
                      <div className="absolute -top-1 -right-1 bg-purple-600 rounded-full p-1">
                        <Bell size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-white truncate">
                        {student.name}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {student.lastMessageTime &&
                        !isNaN(new Date(student.lastMessageTime).getTime())
                          ? new Date(
                              student.lastMessageTime
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate mt-1">
                      {student.lastMessage
                        ? student.lastMessage
                        : "No messages yet"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link href="/tutor/dashboard">
            <button className="mx-4 my-4 p-3 text-white rounded-lg border border-purple-600 hover:bg-purple-900/30 flex items-center justify-center space-x-2 transition-all duration-200">
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </Link>
        </div>

        <div className="flex-1 flex flex-col bg-black custom-scrollbar">
          {selectedStudent ? (
            <>
              <div className="bg-purple-800 p-4 flex items-center shadow-xl h-20">
                <div className="relative">
                  <Image
                    src={selectedStudent.profile || "/default-profile.jpg"}
                    alt={selectedStudent.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                    priority
                  />
                </div>
                <div className="text-white ml-3">
                  <h2 className="font-bold text-lg">{selectedStudent.name}</h2>
                  <p className="text-sm opacity-90">{selectedStudent.email}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black custom-scrollbar">
                {currentMessages.map((message, index) => {
                  const date = new Date(message.createdAt);
                  const timeString = isNaN(date.getTime())
                    ? "Just now"
                    : date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                  return (
                    <div
                      key={index}
                      className={`flex ${
                        message.sender === "tutor"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 shadow-xl ${
                          message.sender === "tutor"
                            ? "bg-purple-600 text-white rounded-tr-none"
                            : "bg-purple-200 text-gray-900 rounded-tl-none"
                        }`}
                      >
                        <p className="text-base">{message.message}</p>
                        <div
                          className={`text-xs mt-2 ${
                            message.sender === "tutor"
                              ? "text-purple-200"
                              : "text-gray-700"
                          }`}
                        >
                          {timeString}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-800 bg-gray-950">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 p-4 border border-gray-800 bg-gray-900 text-white rounded-full focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 placeholder-gray-500 shadow-inner"
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors duration-200 shadow-lg"
                    aria-label="Send message"
                  >
                    <Send size={22} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-black p-8">
              <div className="text-center max-w-md">
                <div className="flex justify-center mb-8">
                  <div className="h-32 w-32 bg-purple-700 rounded-full flex items-center justify-center shadow-xl">
                    <MessageSquare size={64} className="text-white" />
                  </div>
                </div>
                <h1 className="text-white text-3xl font-bold mb-6">
                  Welcome to Code Sphere
                </h1>
                <p className="text-gray-300 mb-8 text-lg">
                  Select a conversation from the left to start chatting with
                  your students.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
