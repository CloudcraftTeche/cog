"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  User,
  BookOpen,
  Bell,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import api from "@/lib/api";
import { IUser, IMessage, IGrade } from "@/types/chat.types";
import { ConnectionStatus } from "@/components/shared/ConnectionStatus";
import { MessageBubble } from "@/components/shared/MessageBubble";
import { MessageInput } from "@/components/shared/MessageInput";
import { useAuth } from "@/hooks/useAuth";
const StudentChatPanel: React.FC = () => {
  const [activeChat, setActiveChat] = useState<IUser | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [teachers, setTeachers] = useState<IUser[]>([]);
  const [admins, setAdmins] = useState<IUser[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [myGrade, setMyGrade] = useState<IGrade | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = useAuth().user?.id;
  const { isConnected, connectionError, sendTyping } = useSocket({
    onMessage: (message: IMessage) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
      setTimeout(() => scrollToBottom(), 100);
    },
    onTyping: (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    },
  });
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    fetchMyInfo();
    fetchTeachers();
    fetchAdmins();
    fetchUnreadCount();
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);
  useEffect(() => {
    if (activeChat) {
      fetchConversation(activeChat._id);
    }
  }, [activeChat]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const fetchMyInfo = async () => {
    try {
      const response = await api.get("/auth/me");
      if (response.data.success && response.data.data.gradeId) {
        setMyGrade(response.data.data.gradeId);
      }
    } catch (error) {
      console.error("Failed to fetch info:", error);
    }
  };
  const fetchTeachers = async () => {
    try {
      const gradeRes = await api.get("/auth/me");
      const gradeId = gradeRes.data.data.gradeId?._id;
      const response = await api.get(`/teachers/grade/${gradeId}`);
      if (response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    }
  };
  const fetchAdmins = async () => {
    try {
      const response = await api.get("/admin");
      if (response.data.success) {
        setAdmins(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    }
  };
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/chat/unread-count");
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };
  const fetchConversation = async (userId: string) => {
    setMessages([]);
    try {
      const response = await api.get(`/chat/conversation/${userId}`);
      if (response.data.success) {
        setMessages(response.data.data);
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
    }
  };
  const handleSendMessage = async (content: string) => {
    if (!activeChat) return;
    const payload = {
      content,
      recipientId: activeChat._id,
    };
    const response = await api.post("/chat/unicast", payload);
    setMessages((prev) => {
      if (prev.some((msg) => msg._id === response.data.data._id)) return prev;
      return [...prev, response.data.data];
    });
  };
  const handleTyping = (isTyping: boolean) => {
    if (activeChat) {
      sendTyping(`user-${activeChat._id}`, activeChat._id, isTyping);
    }
  };
  const selectChat = (user: IUser) => {
    setActiveChat(user);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };
  const renderContactList = (users: IUser[], title: string, color: string) => (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-2">
        {title}
      </h3>
      <div className="space-y-2">
        {users.map((user) => (
          <button
            key={user._id}
            onClick={() => selectChat(user)}
            className={`w-full p-3 sm:p-4 rounded-xl text-left transition-all ${
              activeChat?._id === user._id
                ? `bg-gradient-to-r ${color} text-white shadow-lg`
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base ${
                  activeChat?._id === user._id
                    ? "bg-white/20"
                    : `${color
                        .replace("from-", "bg-")
                        .replace(" to-amber-500", "")}/10 text-${
                        color.split("-")[1]
                      }-600`
                }`}
              >
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm sm:text-base truncate">
                  {user.name}
                </div>
                <div className="text-xs opacity-80 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {user.role}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
      <ConnectionStatus isConnected={isConnected} error={connectionError} />
      {isMobile && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 p-3 bg-orange-500 text-white rounded-full shadow-lg md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div
        className={`
        ${isMobile ? "fixed inset-y-0 left-0 z-40" : "relative"}
        w-80 max-w-[85vw] bg-white shadow-2xl border-r border-orange-100 
        transition-transform duration-300 ease-in-out
        ${isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"}
        md:translate-x-0
      `}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 sm:p-6 bg-gradient-to-r from-orange-500 to-amber-500 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Messages
              </h2>
              <div className="flex items-center gap-2">
                {isMobile && (
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-white p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            {myGrade && (
              <div className="flex items-center gap-2 text-orange-100 text-xs sm:text-sm">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Grade {myGrade.grade}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-orange-100 mt-2 text-xs sm:text-sm">
              <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{unreadCount} unread</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {renderContactList(
              teachers,
              "My Teachers",
              "from-orange-500 to-amber-500"
            )}
            {renderContactList(
              admins,
              "School Admin",
              "from-amber-500 to-yellow-500"
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {activeChat ? (
          <>
            <div className="bg-white shadow-sm border-b border-gray-200 p-3 sm:p-6 flex-shrink-0">
              <div className="flex items-center gap-3 sm:gap-4">
                {isMobile && (
                  <button
                    onClick={() => setActiveChat(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center text-white font-semibold text-sm sm:text-lg flex-shrink-0">
                  {activeChat.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-xl font-bold text-gray-800 truncate">
                    {activeChat.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {activeChat.role} • {activeChat.email}
                  </p>
                  {typingUsers.has(activeChat._id) && (
                    <p className="text-xs text-blue-500 italic">typing...</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400 px-4">
                    <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-base sm:text-lg font-medium">
                      No messages yet
                    </p>
                    <p className="text-xs sm:text-sm mt-2">
                      Send a message to start the conversation
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg, ind) => (
                  <MessageBubble
                    key={msg?._id || ind}
                    message={msg}
                    isOwnMessage={msg.senderId._id === currentUserId}
                    showSender={msg.senderId._id !== currentUserId}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <MessageInput
              onSend={handleSendMessage}
              disabled={!isConnected}
              onTyping={handleTyping}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
            <div className="text-center text-gray-400">
              <MessageSquare className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 opacity-30" />
              <h3 className="text-lg sm:text-2xl font-bold mb-2">
                Welcome to Messages
              </h3>
              <p className="text-sm sm:text-lg px-4">
                Select a teacher or admin to start chatting
              </p>
              {isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
                >
                  View Contacts
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default StudentChatPanel;
