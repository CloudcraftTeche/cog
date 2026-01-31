"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  MessageSquare,
  Bell,
  Search,
  X,
  Menu,
  ArrowLeft,
  Loader,
} from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import api from "@/lib/api";
import { IUser, IGrade, IMessage } from "@/types/chat.types";
import { ConnectionStatus } from "@/components/shared/ConnectionStatus";
import { MessageBubble } from "@/components/shared/MessageBubble";
import { MessageInput } from "@/components/shared/MessageInput";
import { useAuth } from "@/hooks/auth/useAuth";const SuperAdminChatPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"grade" | "direct">("grade");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [grades, setGrades] = useState<IGrade[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = useAuth().user?.id;
  const { isConnected, connectionError, sendTyping } = useSocket({
    onMessage: (message: IMessage) => {
      console.log("📨 New message received:", message);
      const isRelevant =
        (activeTab === "grade" &&
          message.messageType === "grade" &&
          message.gradeId?._id === selectedGrade) ||
        (activeTab === "direct" &&
          message.messageType === "unicast" &&
          (message.senderId._id === selectedUser?._id ||
            message.recipientId?._id === selectedUser?._id));
      if (isRelevant) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
        setTimeout(() => scrollToBottom(), 100);
      }
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
    fetchGrades();
    fetchUsers();
    fetchUnreadCount();
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);
  useEffect(() => {
    setMessages([]);
    if (activeTab === "grade" && selectedGrade) {
      fetchGradeMessages(selectedGrade);
    } else if (activeTab === "direct" && selectedUser) {
      fetchConversation(selectedUser._id);
    }
  }, [activeTab, selectedGrade, selectedUser]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const fetchGrades = async () => {
    try {
      const response = await api.get("/grades/all");
      setGrades(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch grades:", error);
    }
  };
  const fetchUsers = async () => {
    try {
      const teachersRes = await api.get("/teachers");
      const studentsRes = await api.get("/students");
      const allUsers = [
        ...(teachersRes.data?.data || []),
        ...(studentsRes.data?.data || []),
      ];
      setUsers(allUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
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
  const fetchGradeMessages = async (gradeId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await api.get(`/chat/grade/${gradeId}`);
      if (response.data.success) {
        setMessages(response.data.data || []);
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error("Failed to fetch grade messages:", error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };
  const fetchConversation = async (userId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await api.get(`/chat/conversation/${userId}`);
      if (response.data.success) {
        setMessages(response.data.data || []);
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };
  const handleSendGrade = async (content: string) => {
    if (!selectedGrade) return;
    const payload = {
      content,
      gradeId: selectedGrade,
    };
    try {
      const response = await api.post("/chat/grade", payload);
      if (response.data.success) {
        setMessages((prev) => {
          const newMessage = response.data.data;
          if (prev.some((msg) => msg._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
        scrollToBottom();
      }
    } catch (error) {
      console.error("Failed to send grade message:", error);
      throw error;
    }
  };
  const handleSendDirect = async (content: string) => {
    if (!selectedUser) return;
    const payload = {
      content,
      recipientId: selectedUser._id,
    };
    try {
      const response = await api.post("/chat/unicast", payload);
      if (response.data.success) {
        setMessages((prev) => {
          const newMessage = response.data.data;
          if (prev.some((msg) => msg._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
        scrollToBottom();
      }
    } catch (error) {
      console.error("Failed to send direct message:", error);
      throw error;
    }
  };
  const handleTyping = (isTyping: boolean) => {
    if (activeTab === "grade" && selectedGrade) {
      sendTyping(`grade-${selectedGrade}`, undefined, isTyping);
    } else if (activeTab === "direct" && selectedUser) {
      sendTyping(`user-${selectedUser._id}`, selectedUser._id, isTyping);
    }
  };
  const getTypingIndicator = () => {
    if (activeTab === "grade" && typingUsers.size > 0) {
      return `${typingUsers.size} user${
        typingUsers.size > 1 ? "s" : ""
      } typing...`;
    } else if (
      activeTab === "direct" &&
      selectedUser &&
      typingUsers.has(selectedUser._id)
    ) {
      return "typing...";
    }
    return null;
  };
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const showChatArea =
    (activeTab === "grade" && selectedGrade) ||
    (activeTab === "direct" && selectedUser);
  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 overflow-hidden">
      <ConnectionStatus isConnected={isConnected} error={connectionError} />
      {isMobile && !isSidebarOpen && showChatArea && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 p-3 bg-purple-600 text-white rounded-full shadow-lg md:hidden"
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
      {}
      <div
        className={`
        ${isMobile ? "fixed inset-y-0 left-0 z-40" : "relative"}
        w-80 max-w-[85vw] bg-white shadow-2xl border-r border-purple-100
        transition-transform duration-300 ease-in-out
        ${isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"}
        md:translate-x-0
      `}
      >
        <div className="h-full flex flex-col">
          {}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-600 to-blue-600 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Admin Chat
              </h2>
              {isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-purple-100 text-xs sm:text-sm">
              <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{unreadCount} unread messages</span>
            </div>
          </div>
          {}
          <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
            <button
              onClick={() => {
                setActiveTab("grade");
                setSelectedUser(null);
              }}
              className={`flex-1 py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-medium transition-all ${
                activeTab === "grade"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
              Grade
            </button>
            <button
              onClick={() => {
                setActiveTab("direct");
                setSelectedGrade("");
              }}
              className={`flex-1 py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-medium transition-all ${
                activeTab === "direct"
                  ? "bg-pink-600 text-white"
                  : "text-gray-600 hover:bg-pink-50"
              }`}
            >
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
              Direct
            </button>
          </div>
          {}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {activeTab === "grade" && (
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700">
                  Select Grade
                </label>
                {grades.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No grades available
                  </p>
                ) : (
                  grades.map((grade) => (
                    <button
                      key={grade._id}
                      onClick={() => {
                        setSelectedGrade(grade._id);
                        if (isMobile) setIsSidebarOpen(false);
                      }}
                      className={`w-full p-3 sm:p-4 rounded-xl text-left transition-all ${
                        selectedGrade === grade._id
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <div className="font-semibold text-sm">{grade.grade}</div>
                      <div className="text-xs mt-1 opacity-80">
                        Grade {grade.grade}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
            {activeTab === "direct" && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="space-y-2">
                  {filteredUsers.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No users found
                    </p>
                  ) : (
                    filteredUsers.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => {
                          setSelectedUser(user);
                          if (isMobile) setIsSidebarOpen(false);
                        }}
                        className={`w-full p-3 sm:p-4 rounded-xl text-left transition-all ${
                          selectedUser?._id === user._id
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm ${
                              selectedUser?._id === user._id
                                ? "bg-white/20"
                                : "bg-purple-100 text-purple-600"
                            }`}
                          >
                            {user.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate">
                              {user.name}
                            </div>
                            <div className="text-xs opacity-80 truncate">
                              {user.role}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {}
      <div className="flex-1 flex flex-col min-w-0">
        {showChatArea ? (
          <>
            {}
            <div className="bg-white shadow-sm border-b border-gray-200 p-3 sm:p-6 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {isMobile && (
                    <button
                      onClick={() => {
                        if (activeTab === "direct") setSelectedUser(null);
                        else if (activeTab === "grade") setSelectedGrade("");
                        else setIsSidebarOpen(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-xl font-bold text-gray-800 truncate">
                      {activeTab === "grade" &&
                        (selectedGrade
                          ? `Grade: ${
                              grades.find((g) => g._id === selectedGrade)?.grade
                            }`
                          : "Select a Grade")}
                      {activeTab === "direct" &&
                        (selectedUser ? selectedUser.name : "Select a User")}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                      {activeTab === "grade" && "Message grade students"}
                      {activeTab === "direct" &&
                        selectedUser &&
                        `${selectedUser.role} • ${selectedUser.email}`}
                    </p>
                    {getTypingIndicator() && (
                      <p className="text-xs text-blue-500 italic mt-1">
                        {getTypingIndicator()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader className="w-8 h-8 animate-spin text-purple-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400 px-4">
                    <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-base sm:text-lg font-medium">
                      No messages yet
                    </p>
                    <p className="text-xs sm:text-sm mt-2">
                      Start broadcasting to your users
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    isOwnMessage={msg.senderId._id === currentUserId}
                    showSender={msg.senderId._id !== currentUserId}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            {}
            <MessageInput
              onSend={
                activeTab === "grade" ? handleSendGrade : handleSendDirect
              }
              disabled={!isConnected}
              onTyping={handleTyping}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center text-gray-400">
              <MessageSquare className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                {activeTab === "grade" && "Select a Grade"}
                {activeTab === "direct" && "Select a User"}
              </h3>
              <p className="text-sm px-4">
                {activeTab === "grade" &&
                  "Choose a grade from the list to message students"}
                {activeTab === "direct" &&
                  "Choose a user from the list to start chatting"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default SuperAdminChatPanel;
