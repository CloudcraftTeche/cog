"use client";
import React, { useState, useEffect, useRef } from "react";
import { Users, MessageSquare, Search, BookOpen } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import api from "@/lib/api";
import type {
  IMessage,
  IGrade,
  IUser,
  SendGradeMessagePayload,
  SendUnicastMessagePayload,
} from "@/types/chat.types";
import { ConnectionStatus } from "@/components/shared/ConnectionStatus";
import { MessageBubble } from "@/components/shared/MessageBubble";
import { MessageInput } from "@/components/shared/MessageInput";
import { useAuth } from "@/hooks/auth/useAuth";const TeacherChatPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"grade" | "direct">("grade");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [myGrade, setMyGrade] = useState<IGrade | null>(null);
  const [students, setStudents] = useState<IUser[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<IUser | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = useAuth().user?.id;
  const { isConnected, connectionError, sendTyping } = useSocket({
    onMessage: (message: IMessage) => {
      console.log("📨 New message received:", message);
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
    fetchMyGrade();
    fetchUnreadCount();
  }, []);
  useEffect(() => {
    if (activeTab === "grade" && myGrade) {
      fetchGradeMessages();
    } else if (activeTab === "direct" && selectedStudent) {
      fetchConversation(selectedStudent._id);
    } else {
      setMessages([]);
    }
  }, [activeTab, selectedStudent, myGrade]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const fetchMyGrade = async () => {
    try {
      const response = await api.get("/auth/me");
      if (response.data.success && response.data.data.gradeId) {
        setMyGrade(response.data.data.gradeId);
        fetchStudents(response.data.data.gradeId._id);
      }
    } catch (error) {
      console.error("Failed to fetch grade:", error);
    }
  };
  const fetchStudents = async (gradeId: string) => {
    try {
      const response = await api.get(`/students/grade/${gradeId}`);
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
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
  const fetchConversation = async (studentId: string) => {
    setMessages([]);
    try {
      const response = await api.get(`/chat/conversation/${studentId}`);
      if (response.data.success) {
        setMessages(response.data.data || []);
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
    }
  };
  const fetchGradeMessages = async () => {
    if (!myGrade) return;
    setMessages([]);
    try {
      const response = await api.get(`/chat/grade/${myGrade._id}`);
      if (response.data.success) {
        setMessages(response.data.data || []);
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error("Failed to fetch grade messages:", error);
    }
  };
  const handleSendGradeMessage = async (content: string) => {
    if (!myGrade) return;
    const payload: SendGradeMessagePayload = {
      content,
      gradeId: myGrade._id,
    };
    const response = await api.post("/chat/grade", payload);
    if (response.data.success) {
      setMessages((prev) => {
        if (prev.some((msg) => msg._id === response.data.data._id)) return prev;
        return [...prev, response.data.data];
      });
      setTimeout(() => scrollToBottom(), 100);
    }
  };
  const handleSendDirectMessage = async (content: string) => {
    if (!selectedStudent) return;
    const payload: SendUnicastMessagePayload = {
      content,
      recipientId: selectedStudent._id,
    };
    const response = await api.post("/chat/unicast", payload);
    if (response.data.success) {
      setMessages((prev) => {
        if (prev.some((msg) => msg._id === response.data.data._id)) return prev;
        return [...prev, response.data.data];
      });
      setTimeout(() => scrollToBottom(), 100);
    }
  };
  const handleTyping = (isTyping: boolean) => {
    if (activeTab === "grade" && myGrade) {
      sendTyping(`grade-${myGrade._id}`, undefined, isTyping);
    } else if (activeTab === "direct" && selectedStudent) {
      sendTyping(`user-${selectedStudent._id}`, selectedStudent._id, isTyping);
    }
  };
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const getTypingIndicator = () => {
    if (activeTab === "grade" && typingUsers.size > 0) {
      return `${typingUsers.size} student${
        typingUsers.size > 1 ? "s" : ""
      } typing...`;
    } else if (
      activeTab === "direct" &&
      selectedStudent &&
      typingUsers.has(selectedStudent._id)
    ) {
      return "typing...";
    }
    return null;
  };
  return (
    <div className="flex h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <ConnectionStatus isConnected={isConnected} error={connectionError} />
      {}
      <div className="w-80 bg-white shadow-2xl border-r border-teal-100">
        <div className="h-full flex flex-col">
          {}
          <div className="p-6 bg-gradient-to-r from-teal-600 to-cyan-600 flex-shrink-0">
            <h2 className="text-2xl font-bold text-white mb-2">Teacher Chat</h2>
            {myGrade && (
              <div className="flex items-center gap-2 text-teal-100">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">Grade {myGrade.grade}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-teal-100 mt-2">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">{unreadCount} unread</span>
            </div>
          </div>
          {}
          <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
            <button
              onClick={() => setActiveTab("grade")}
              className={`flex-1 py-4 px-4 text-sm font-medium transition-all ${
                activeTab === "grade"
                  ? "bg-teal-600 text-white"
                  : "text-gray-600 hover:bg-teal-50"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              My Grade
            </button>
            <button
              onClick={() => setActiveTab("direct")}
              className={`flex-1 py-4 px-4 text-sm font-medium transition-all ${
                activeTab === "direct"
                  ? "bg-cyan-600 text-white"
                  : "text-gray-600 hover:bg-cyan-50"
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Students
            </button>
          </div>
          {}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "grade" && myGrade && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-teal-100 to-cyan-100 p-6 rounded-xl">
                  <BookOpen className="w-12 h-12 text-teal-600 mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Grade {myGrade.grade}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Broadcast to all students in your grade
                  </p>
                  <div className="flex items-center gap-2 text-teal-700">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {students.length} students
                    </span>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "direct" && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  {filteredStudents.map((student) => (
                    <button
                      key={student._id}
                      onClick={() => setSelectedStudent(student)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        selectedStudent?._id === student._id
                          ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                            selectedStudent?._id === student._id
                              ? "bg-white/20"
                              : "bg-teal-100 text-teal-600"
                          }`}
                        >
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{student.name}</div>
                          <div className="text-xs opacity-80">
                            {student.rollNumber || student.email}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {}
      <div className="flex-1 flex flex-col">
        {}
        <div className="bg-white shadow-sm border-b border-gray-200 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {activeTab === "grade" && myGrade && `Grade ${myGrade.grade}`}
                {activeTab === "direct" &&
                  (selectedStudent ? selectedStudent.name : "Select a Student")}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {activeTab === "grade" && `Message ${students.length} students`}
                {activeTab === "direct" &&
                  selectedStudent &&
                  selectedStudent.email}
              </p>
              {getTypingIndicator() && (
                <p className="text-xs text-blue-500 italic mt-1">
                  {getTypingIndicator()}
                </p>
              )}
            </div>
          </div>
        </div>
        {}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm mt-2">
                  Start a conversation with your students
                </p>
              </div>
            </div>
          ) : (
            messages &&
            messages?.map((msg, ind) => (
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
        {}
        <MessageInput
          onSend={
            activeTab === "grade"
              ? handleSendGradeMessage
              : handleSendDirectMessage
          }
          disabled={
            !isConnected || (activeTab === "direct" && !selectedStudent)
          }
          onTyping={handleTyping}
        />
      </div>
    </div>
  );
};
export default TeacherChatPanel;
