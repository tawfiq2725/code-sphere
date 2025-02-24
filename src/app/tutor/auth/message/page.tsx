"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bell, Menu, MoreVertical, Send, Users } from "lucide-react";

export default function ChatApp() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "John Doe",
      content: "Hey everyone! How's it going?",
      isSelf: false,
    },
    {
      id: 2,
      sender: "You",
      content: "Hi John! Everything's great, thanks for asking!",
      isSelf: true,
    },
    {
      id: 3,
      sender: "Alice Smith",
      content: "I'm excited about our new project! 🚀",
      isSelf: false,
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: "You",
          content: input,
          isSelf: true,
        },
      ]);
      setInput("");
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 lg:w-80 flex-col bg-black border-r border-gray-800">
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            ChatApp
          </h1>
          <button className="text-white hover:text-purple-400 transition-colors">
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-2">
          {["General", "Random", "Ideas", "Planning"].map((channel) => (
            <button
              key={channel}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-purple-900 hover:text-purple-200 transition-all duration-200 ease-in-out"
            >
              # {channel}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 ease-in-out flex items-center justify-center">
            <Users className="mr-2 h-4 w-4" />
            Online Users
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-black">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold">
              G
            </div>
            <div>
              <h2 className="text-lg font-semibold">#general</h2>
              <p className="text-sm text-gray-400">120 members</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-white hover:text-purple-400 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <button className="text-white hover:text-purple-400 transition-colors">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-4 ${
                message.isSelf ? "justify-end" : ""
              }`}
            >
              {!message.isSelf && (
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold">
                  {message.sender[0]}
                </div>
              )}
              <div
                className={`rounded-lg p-3 max-w-[70%] ${
                  message.isSelf ? "bg-purple-600" : "bg-gray-800"
                }`}
              >
                <p
                  className={`font-semibold ${
                    message.isSelf ? "text-purple-200" : "text-purple-300"
                  }`}
                >
                  {message.sender}
                </p>
                <p className="mt-1">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-800 bg-black">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              className="flex-1 bg-gray-800 border border-gray-700 focus:border-purple-500 text-white placeholder-gray-400 rounded-lg px-4 py-2 outline-none"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 ease-in-out"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
