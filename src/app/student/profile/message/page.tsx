"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, MessageSquare, Bell } from "lucide-react";
import Link from "next/link";
import { Socket } from "socket.io-client";
import { Message, User } from "@/interface/user";
import { useSelector } from "react-redux";
import api from "@/api/axios";
import { createSocket } from "@/utils/config/socket";
import Image from "next/image";
import { showToast } from "@/utils/toastUtil";
import { signedUrltoNormalUrl } from "@/utils/presignedUrl";

export default function StudentChat() {
  const [tutors, setTutors] = useState<User[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<User | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const { user } = useSelector((state: any) => state.auth);
  const [chatId, setChatId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const storedUserId = user.user._id;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  useEffect(() => {
    const s = createSocket();
    setSocket(s);

    s.on("connect", () => {
      console.log("Socket connected:", s.id);
    });

    s.on("chat:history", (chat: any) => {
      console.log("Chat history received:", chat);
      if (
        chat &&
        chat._id &&
        selectedTutor &&
        chat.tutorId === selectedTutor._id
      ) {
        setChatId(chat._id);
        setCurrentMessages(chat.messages || []);
      }
    });

    s.on("message:receive", (message: Message) => {
      console.log("New message received:", message);
      setCurrentMessages((prev) => {
        if (prev.some((msg) => msg._id === message._id)) return prev;
        return [...prev, message];
      });
    });
    s.on("chat:blocked", (data: { error: string }) => {
      showToast(data.error, "error");
      setSelectedTutor(null);
    });

    s.on("message:blocked", (data: { error: string }) => {
      showToast(data.error, "error");
    });

    s.on("message:error", (data: { error: string }) => {
      showToast(data.error, "error");
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
          setTutors((prevTutors) =>
            prevTutors.map((tutor) =>
              tutor._id === notification.senderId
                ? { ...tutor, hasNewMessage: true }
                : tutor
            )
          );
        }
        showToast(notification.message, "info");
      }
    );

    return () => {
      s.disconnect();
    };
  }, [selectedTutor]);

  useEffect(() => {
    if (socket && storedUserId) {
      socket.emit("register", { type: "student", id: storedUserId });
    }
  }, [socket, storedUserId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/student/tutor/${storedUserId}`);
        setTutors(data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [storedUserId]);

  for (const student of tutors) {
    if (student.profile)
      student.profile = signedUrltoNormalUrl(student.profile);
  }

  useEffect(() => {
    if (socket && selectedTutor && storedUserId) {
      if (chatId) {
        socket.emit("leave", chatId);
      }
      setChatId(null);
      setCurrentMessages([]);
      socket.emit("join:chat", {
        tutorId: selectedTutor._id,
        userId: storedUserId,
      });

      // Reset hasNewMessage for the selected tutor
      setTutors((prevTutors) =>
        prevTutors.map((tutor) =>
          tutor._id === selectedTutor._id
            ? { ...tutor, hasNewMessage: false }
            : tutor
        )
      );
    }
  }, [selectedTutor, socket, storedUserId]);

  const handleTutorSelect = (tutor: User) => {
    setSelectedTutor(tutor);
  };

  const handleSendMessage = async () => {
    if (selectedTutor?.isBlocked) {
      return showToast(
        "The tutor has been blocked now and you can't send messages to him/her. Contact admin.",
        "error"
      );
    }

    if (
      !inputMessage.trim() ||
      !selectedTutor ||
      !chatId ||
      !storedUserId ||
      !socket
    )
      return;

    socket.emit("message:send", {
      chatId,
      tutorId: selectedTutor._id,
      userId: storedUserId,
      sender: "student",
      message: inputMessage,
      type: "txt",
    });

    setInputMessage("");
  };

  return (
    <div className="flex h-screen bg-black items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-6xl h-[90vh] bg-gray-950 rounded-xl shadow-2xl overflow-hidden border border-purple-800">
        {/* Left Panel - Tutor List */}
        <div className="w-full md:w-1/3 border-r border-purple-900 flex flex-col">
          <div className="bg-purple-800 p-4 shadow-xl h-20 flex items-center justify-between">
            <h2 className="text-white text-lg font-bold tracking-wide">
              Messages
            </h2>
            <div className="bg-purple-700 px-3 py-1 rounded-full text-xs text-white font-medium">
              {tutors.length} Tutors
            </div>
          </div>

          <div className="custom-scrollbar flex-1 overflow-y-auto bg-gray-950 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-900">
            {tutors.map((tutor, index) => (
              <div
                key={index}
                className={`p-4 border-b border-gray-800 hover:bg-gray-900 cursor-pointer transition-all duration-200 ${
                  selectedTutor?._id === tutor._id
                    ? "bg-gray-900 border-l-4 border-l-purple-600"
                    : ""
                }`}
                onClick={() => handleTutorSelect(tutor)}
              >
                <div className="flex items-center space-x-3 relative">
                  <div className="relative">
                    <Image
                      src={tutor.profile || "/default-profile.jpg"}
                      alt={tutor.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-500 shadow-md"
                      width={48}
                      height={48}
                      priority
                    />
                    {tutor.hasNewMessage && (
                      <div className="absolute -top-1 -right-1 bg-purple-600 rounded-full p-1">
                        <Bell size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-white truncate">
                        {tutor.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-400 truncate mt-1">
                      {tutor.email}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link href={`/tutor/auth/enroll-student`}>
            <button className="mx-4 my-4 p-3 text-white rounded-lg border border-purple-600 hover:bg-purple-900/30 flex items-center justify-center space-x-2 transition-all duration-200">
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </Link>
        </div>

        {/* Right Panel - Chat Area */}
        <div className="flex-1 flex flex-col bg-black custom-scrollbar">
          {selectedTutor ? (
            <>
              <div className="bg-purple-800 p-4 flex items-center shadow-xl h-20 custom-scrollbar">
                <div className="relative">
                  <Image
                    src={selectedTutor.profile || "/placeholder.svg"}
                    alt={selectedTutor.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                    width={48}
                    height={48}
                    priority
                  />
                </div>
                <div className="text-white ml-3">
                  <h2 className="font-bold text-lg">{selectedTutor.name}</h2>
                  <p className="text-sm opacity-90">
                    {selectedTutor.subjects?.join(", ")}
                  </p>
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
                        message.sender === "student"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 shadow-xl ${
                          message.sender === "student"
                            ? "bg-purple-600 text-white rounded-tr-none"
                            : "bg-purple-200 text-gray-900 rounded-tl-none"
                        }`}
                      >
                        <p className="text-base">{message.message}</p>
                        <div
                          className={`text-xs mt-2 ${
                            message.sender === "student"
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
                  your healthcare provider. All your medical conversations are
                  secure and encrypted.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
