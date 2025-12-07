"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Users,
  Search,
  MoreVertical,
  Send,
  Shield,
  Crown,
  User,
  Check,
  CheckCheck,
  Flag,
  MessageCircle,
  Loader,
  AlertTriangle,
  X,
  RefreshCw,
  Sparkles,
  Bell,
} from "lucide-react";
import api from "@/lib/api";
import { socketService } from "@/hooks/useSocket";

interface UserType {
  _id: string;
  name: string;
  role: string;
  profilePictureUrl?: string | null;
}

interface GradeType {
  _id: string;
  grade: string;
  students: UserType[];
  teachers: UserType[];
}

interface MessageType {
  _id: string;
  content: string;
  sender: UserType;
  createdAt: string | Date;
  messageType: "text" | "image" | "video" | "pdf" | "system";
  status: "sent" | "delivered" | "read";
  moderationStatus: "approved" | "pending" | "rejected" | "flagged";
}

interface ChatType {
  _id: string;
  name: string;
  chatType: "class" | "private" | "broadcast";
  participants: UserType[];
  lastMessage?: MessageType;
  lastActivity: string | Date;
  unreadCount: number;
}

export default function AdminChatDashboard() {
  const [user, setUser] = useState<UserType | null>(null);
  const [grades, setGrades] = useState<GradeType[]>([]);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showModerationPanel, setShowModerationPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(
    new Map()
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [chatType, setChatType] = useState<"class" | "private" | "broadcast">(
    "class"
  );
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && user) {
      socketService.connect(token);

      if (user._id) {
        socketService.setUserOnline(user._id);
      }

      socketService.onNewMessage((data: any) => {
        const { message, chatId } = data;

        if (selectedChat?._id === chatId) {
          setMessages((prev) => [...prev, message]);
        }

        setChats((prev) =>
          prev.map((chat) =>
            chat._id === chatId
              ? {
                  ...chat,
                  lastMessage: message,
                  lastActivity: message.createdAt,
                }
              : chat
          )
        );
      });

      socketService.onMessageModerated((data: any) => {
        const { messageId, moderationStatus } = data;
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, moderationStatus } : msg
          )
        );
      });

      socketService.onUserTyping((data: any) => {
        setTypingUsers((prev) => new Map(prev).set(data.userId, data.userName));
      });

      socketService.onUserStoppedTyping((data: any) => {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });
      });

      socketService.onMessageError((error: any) => {
        setError(error.message || "An error occurred");
      });

      return () => {
        socketService.offNewMessage();
        socketService.offMessageModerated();
        socketService.offTypingEvents();
        socketService.disconnect();
      };
    }
  }, [user, selectedChat]);

  useEffect(() => {
    if (chats.length > 0 && socketService.isConnected()) {
      const chatIds = chats.map((chat) => chat._id);
      socketService.joinChats(chatIds);
    }
  }, [chats]);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      setUser(res.data.data.user);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    }
  };

  const fetchGrades = async () => {
    try {
      const res = await api.get("/chats/grades");
      setGrades(res.data.grades);
    } catch (err) {
      console.error("Error fetching grades:", err);
      setError("Failed to load grades");
    }
  };

  const fetchChats = async () => {
    try {
      const res = await api.get("/chats");
      setChats(res.data.chats);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError("Failed to load chats");
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const res = await api.get(`/chats/${chatId}/messages`);
      setMessages(res.data.messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages");
    }
  };

  const initializeData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchGrades(), fetchChats()]);
    } catch (err) {
      setError("Failed to initialize dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (selectedChat) fetchMessages(selectedChat._id);
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const searchUsers = async (query: string) => {
    if (!query.trim()) return setUserResults([]);
    try {
      const res = await api.get(`/chats/users/search?query=${query}`);
      setUserResults(res.data.users);
    } catch (err) {
      console.error("Error searching users:", err);
    }
  };

  const handleTyping = () => {
    if (!selectedChat || !user) return;

    socketService.startTyping(selectedChat._id, user._id, user.name);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(selectedChat._id, user._id);
    }, 3000);
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !user) return;

    if (selectedChat.chatType === "broadcast") {
      if (!broadcastMessage.trim() || sending) return;
      try {
        setSending(true);
        await api.post("/chats/broadcast", { content: broadcastMessage });

        socketService.sendMessage({
          chatId: selectedChat._id,
          content: broadcastMessage,
          messageType: "text",
        });

        setBroadcastMessage("");
      } catch (err) {
        console.error("Error sending broadcast message:", err);
        setError("Failed to send broadcast message");
      } finally {
        setSending(false);
      }
      return;
    }

    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await api.post(`/chats/${selectedChat._id}/messages`, {
        content: newMessage,
        messageType: "text",
      });

      socketService.sendMessage({
        chatId: selectedChat._id,
        content: newMessage,
        messageType: "text",
      });

      socketService.stopTyping(selectedChat._id, user._id);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleModerateMessage = async (
    messageId: string,
    action: "approved" | "rejected" | "flagged"
  ) => {
    try {
      await api.patch(`/chats/messages/${messageId}/moderate`, { action });
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, moderationStatus: action } : msg
        )
      );
    } catch (err) {
      console.error("Error moderating message:", err);
      setError("Failed to moderate message");
    }
  };

  const handleCreateChat = async () => {
    try {
      if (chatType === "class") {
        if (!selectedGrade) return;
        await api.post("/chats/class", { gradeId: selectedGrade });
      } else if (chatType === "private") {
        if (!selectedUser) return;
        await api.post("/chats/private", { recipientId: selectedUser._id });
      } else if (chatType === "broadcast") {
        if (!broadcastMessage.trim()) return;
        await api.post("/chats/broadcast", { content: broadcastMessage });
      }
      setShowCreateModal(false);
      resetCreateModal();
      fetchChats();
    } catch (err) {
      console.error("Error creating chat:", err);
      setError("Failed to create chat");
    }
  };

  const resetCreateModal = () => {
    setSelectedGrade("");
    setSelectedUser(null);
    setUserSearch("");
    setUserResults([]);
    setBroadcastMessage("");
    setChatType("class");
  };

  const formatTime = (date: string | Date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diff = now.getTime() - messageDate.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000)
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    return messageDate.toLocaleDateString();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
      case "superAdmin":
        return <Crown className="w-3 h-3 text-amber-500" />;
      case "teacher":
        return <Shield className="w-3 h-3 text-blue-500" />;
      default:
        return <User className="w-3 h-3 text-gray-500" />;
    }
  };

  const getMessageStatus = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="w-3 h-3 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const getChatTypeBadge = (type: string) => {
    switch (type) {
      case "class":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "private":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "broadcast":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingMessages = messages.filter(
    (msg) => msg.moderationStatus === "pending"
  );

  const typingUsersArray = Array.from(typingUsers.values()).filter(
    (name) => name !== user?.name
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <Sparkles className="w-6 h-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-white/80 text-lg">Loading Admin Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900">
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-slide-down">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 hover:bg-red-600 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="w-1/3 bg-white/95 backdrop-blur-xl border-r border-white/20 flex flex-col shadow-2xl">
        <div className="p-6 bg-indigo-600 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Crown className="w-6 h-6 text-amber-300" />
                Admin Control
              </h1>
              <p className="text-white/80 text-sm mt-1">
                {user?.name} • System Administrator
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowModerationPanel(!showModerationPanel)}
                className="p-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200 relative group"
                title="Moderation Panel"
              >
                <Flag className="w-5 h-5" />
                {pendingMessages.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {pendingMessages.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200 group"
                title="Create Chat"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              </button>
              <button
                onClick={() => initializeData()}
                className="p-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredChats.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No conversations yet</p>
              <p className="text-gray-400 text-sm">
                Create your first chat to get started
              </p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  selectedChat?._id === chat._id
                    ? "bg-indigo-500 text-white shadow-xl transform scale-[1.02]"
                    : "bg-white/80 hover:bg-white/90 backdrop-blur-sm"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 ${
                      chat.chatType === "class"
                        ? "bg-emerald-500"
                        : chat.chatType === "private"
                        ? "bg-purple-500"
                        : "bg-orange-500"
                    } rounded-2xl flex items-center justify-center text-white font-bold shadow-lg`}
                  >
                    {chat.chatType === "class" ||
                    chat.chatType === "broadcast" ? (
                      <Users className="w-7 h-7" />
                    ) : (
                      <span className="text-lg">
                        {chat.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={`font-semibold truncate ${
                          selectedChat?._id === chat._id
                            ? "text-white"
                            : "text-gray-900"
                        }`}
                      >
                        {chat.name}
                      </h3>
                      <span
                        className={`text-xs ${
                          selectedChat?._id === chat._id
                            ? "text-white/80"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTime(chat.lastActivity)}
                      </span>
                    </div>
                    {chat.lastMessage && (
                      <p
                        className={`text-sm truncate mb-2 ${
                          selectedChat?._id === chat._id
                            ? "text-white/90"
                            : "text-gray-600"
                        }`}
                      >
                        <span className="font-medium">
                          {chat.lastMessage.sender.name}:
                        </span>
                        {" " + chat.lastMessage.content}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs px-3 py-1 rounded-full border font-medium ${
                          selectedChat?._id === chat._id
                            ? "bg-white/20 text-white border-white/30"
                            : getChatTypeBadge(chat.chatType)
                        }`}
                      >
                        {chat.chatType.charAt(0).toUpperCase() +
                          chat.chatType.slice(1)}
                      </span>
                      {chat.unreadCount > 0 && (
                        <span className="w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse shadow-lg">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl">
        {selectedChat ? (
          <>
            <div className="p-6 bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 ${
                      selectedChat.chatType === "class"
                        ? "bg-emerald-500"
                        : selectedChat.chatType === "private"
                        ? "bg-purple-500"
                        : "bg-orange-500"
                    } rounded-2xl flex items-center justify-center text-white font-bold shadow-lg`}
                  >
                    {selectedChat.chatType === "class" ||
                    selectedChat.chatType === "broadcast" ? (
                      <Users className="w-6 h-6" />
                    ) : (
                      <span>{selectedChat.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      {selectedChat.name}
                      {selectedChat.chatType === "broadcast" && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                          BROADCAST
                        </span>
                      )}
                    </h2>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {selectedChat.participants.length} participants
                      {socketService.isConnected() && (
                        <span className="text-green-600 text-xs">
                          • Connected
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pendingMessages.length > 0 && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full font-medium flex items-center gap-1">
                      <Bell className="w-4 h-4" />
                      {pendingMessages.length} pending
                    </span>
                  )}
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="text-center py-16">
                  <MessageCircle className="w-20 h-20 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No messages yet
                  </h3>
                  <p className="text-white/70">
                    Start the conversation by sending the first message
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.sender._id === user?._id;
                  return (
                    <div
                      key={message._id}
                      className={`flex gap-4 ${
                        isOwnMessage ? "flex-row-reverse" : ""
                      } group`}
                    >
                      <div
                        className={`w-10 h-10 ${
                          isOwnMessage ? "bg-purple-500" : "bg-gray-500"
                        } rounded-full flex items-center justify-center text-white font-semibold shadow-lg flex-shrink-0`}
                      >
                        {message.sender.name.charAt(0).toUpperCase()}
                      </div>
                      <div
                        className={`flex-1 max-w-lg ${
                          isOwnMessage ? "flex flex-col items-end" : ""
                        }`}
                      >
                        <div
                          className={`flex items-center gap-3 mb-2 ${
                            isOwnMessage ? "flex-row-reverse" : ""
                          }`}
                        >
                          <span className="font-semibold text-white">
                            {message.sender.name}
                          </span>
                          {getRoleIcon(message.sender.role)}
                          <span className="text-white/60 text-sm">
                            {formatTime(message.createdAt)}
                          </span>
                          {getMessageStatus(message.status)}
                          {message.moderationStatus === "pending" && (
                            <span className="px-2 py-1 bg-amber-500/20 text-amber-200 text-xs rounded-full border border-amber-500/30">
                              Pending Review
                            </span>
                          )}
                          {message.moderationStatus === "rejected" && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-200 text-xs rounded-full border border-red-500/30">
                              Rejected
                            </span>
                          )}
                          {message.moderationStatus === "flagged" && (
                            <span className="px-2 py-1 bg-orange-500/20 text-orange-200 text-xs rounded-full border border-orange-500/30">
                              Flagged
                            </span>
                          )}
                        </div>
                        <div
                          className={`rounded-2xl p-4 border shadow-lg ${
                            isOwnMessage
                              ? "bg-purple-600 text-white border-purple-400/30"
                              : "bg-white/10 backdrop-blur-sm border-white/20 text-white"
                          }`}
                        >
                          <p className="leading-relaxed">{message.content}</p>
                        </div>

                        {message.moderationStatus === "pending" &&
                          showModerationPanel &&
                          !isOwnMessage && (
                            <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() =>
                                  handleModerateMessage(message._id, "approved")
                                }
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleModerateMessage(message._id, "rejected")
                                }
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() =>
                                  handleModerateMessage(message._id, "flagged")
                                }
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-amber-500/25"
                              >
                                Flag
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })
              )}
              {typingUsersArray.length > 0 && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                    <Loader className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3">
                    <p className="text-white/80 text-sm">
                      {typingUsersArray.join(", ")}{" "}
                      {typingUsersArray.length === 1 ? "is" : "are"} typing...
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-white/90 backdrop-blur-xl border-t border-white/20">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <textarea
                    placeholder={
                      selectedChat.chatType === "broadcast"
                        ? "Type your broadcast message..."
                        : "Type your message..."
                    }
                    value={
                      selectedChat.chatType === "broadcast"
                        ? broadcastMessage
                        : newMessage
                    }
                    onChange={(e) => {
                      if (selectedChat.chatType === "broadcast") {
                        setBroadcastMessage(e.target.value);
                      } else {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }
                    }}
                    className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-inner"
                    rows={1}
                    disabled={sending}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={
                    sending ||
                    (selectedChat.chatType === "broadcast"
                      ? !broadcastMessage.trim()
                      : !newMessage.trim())
                  }
                  className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25 hover:scale-105"
                >
                  {sending ? (
                    <Loader className="w-6 h-6 animate-spin" />
                  ) : (
                    <Send className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <MessageCircle className="w-16 h-16 text-white/60" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Welcome to Admin Control
              </h3>
              <p className="text-white/70 text-lg max-w-md">
                Select a conversation from the sidebar to start monitoring and
                managing communications
              </p>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  Create New Chat
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateModal();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chat Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["class", "private", "broadcast"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setChatType(type as any)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                        chatType === type
                          ? `border-purple-500 bg-purple-50 text-purple-700`
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <div className="text-center">
                        {type === "class" && (
                          <Users className="w-5 h-5 mx-auto mb-1" />
                        )}
                        {type === "private" && (
                          <MessageCircle className="w-5 h-5 mx-auto mb-1" />
                        )}
                        {type === "broadcast" && (
                          <Bell className="w-5 h-5 mx-auto mb-1" />
                        )}
                        <div className="text-xs font-medium capitalize">
                          {type}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {chatType === "class" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Grade
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="">Choose a grade...</option>
                    {grades.map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.grade} ({g.students.length} students)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {chatType === "private" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Find User
                  </label>
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={userSearch}
                      onChange={(e) => {
                        setUserSearch(e.target.value);
                        searchUsers(e.target.value);
                      }}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  {userResults.length > 0 && (
                    <div className="mt-3 max-h-40 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50">
                      {userResults.map((u) => (
                        <div
                          key={u._id}
                          onClick={() => setSelectedUser(u)}
                          className={`p-3 cursor-pointer hover:bg-white transition-colors flex items-center gap-3 ${
                            selectedUser?._id === u._id
                              ? "bg-purple-50 border-l-4 border-purple-500"
                              : ""
                          }`}
                        >
                          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {u.name}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              {u.role}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedUser && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-sm text-green-700 font-medium">
                        Selected: {selectedUser.name} ({selectedUser.role})
                      </p>
                    </div>
                  )}
                </div>
              )}

              {chatType === "broadcast" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Broadcast Message
                  </label>
                  <textarea
                    placeholder="Type your announcement message..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-24"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    This message will be sent to all users in the system
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 rounded-b-3xl">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateModal();
                }}
                className="flex-1 px-6 py-3 text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-100 font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChat}
                disabled={
                  (chatType === "class" && !selectedGrade) ||
                  (chatType === "private" && !selectedUser) ||
                  (chatType === "broadcast" && !broadcastMessage.trim())
                }
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25"
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {showModerationPanel && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white/95 backdrop-blur-xl shadow-2xl border-l border-white/20 z-40 transform transition-transform duration-300">
          <div className="p-6 bg-amber-500 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Flag className="w-5 h-5" />
                Moderation Center
              </h3>
              <button
                onClick={() => setShowModerationPanel(false)}
                className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                Pending Messages ({pendingMessages.length})
              </h4>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {pendingMessages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-gray-500">All messages approved!</p>
                  <p className="text-gray-400 text-sm">
                    No pending moderation tasks
                  </p>
                </div>
              ) : (
                pendingMessages.map((message) => (
                  <div
                    key={message._id}
                    className="p-4 border-2 border-amber-200 rounded-2xl bg-amber-50 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {message.sender.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {message.sender.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-4 bg-white p-3 rounded-lg">
                      {message.content}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleModerateMessage(message._id, "approved")
                        }
                        className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg font-medium transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleModerateMessage(message._id, "rejected")
                        }
                        className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg font-medium transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() =>
                          handleModerateMessage(message._id, "flagged")
                        }
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-lg font-medium transition-colors"
                      >
                        Flag
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
