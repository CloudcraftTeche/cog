"use client";
import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Users,
  Search,
  Settings,
  Pin,
  Smile,
  User,
  Clock,
  Check,
  CheckCheck,
  BookOpen,
  Download,
  FileText,
  ImageIcon,
  AlertCircle,
  Eye,
  Loader,
  AlertTriangle,
  X,
  RefreshCw,
  Send,
  Menu,
} from "lucide-react";
import api from "@/lib/api";

const emojis = ["👍", "❤️", "😊", "🎉", "🤔", "👏"];

export default function StudentChatInterface() {
  const [user, setUser] = useState<any>(null);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState<any>(false);
  const [error, setError] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    initializeData();

    const interval = setInterval(() => {
      if (selectedChat) {
        fetchMessages(selectedChat._id, false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat]);

  const initializeData = async () => {
    try {
      setLoading(true);
      setError(null);
      await fetchUserProfile();
      await fetchChats();
    } catch (err) {
      setError("Failed to initialize application. Please refresh the page.");
      console.error("Initialization error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/auth/profile");

      if (response.data.data.user) {
        setUser(response.data.data.user);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      throw error;
    }
  };

  const fetchChats = async () => {
    try {
      const response = await api.get("/chats");
      if (response.data.success) {
        const chatList = response.data.chats || [];
        setChats(chatList);

        if (chatList.length > 0 && !selectedChat) {
          setSelectedChat(chatList[0]);
        }
      }
    } catch (error: any) {
      console.error("Error fetching chats:", error);
      if (error.response?.status !== 401) {
        setError("Failed to load chats. Please try again.");
      }
    }
  };

  const fetchMessages = async (chatId: any, showLoader = true) => {
    if (!chatId) return;

    try {
      if (showLoader) setRefreshing(true);
      const response = await api.get(`/chats/${chatId}/messages`);
      if (response.data.success) {
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (showLoader) {
        setError("Failed to load messages. Please try again.");
      }
    } finally {
      if (showLoader) setRefreshing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return;

    const messageContent = newMessage.trim();

    if (selectedChat.chatType === "class" && messageContent.length > 500) {
      setError("Message is too long. Please keep it under 500 characters.");
      return;
    }

    try {
      setSending(true);
      setError(null);

      const response = await api.post(`/chats/${selectedChat._id}/messages`, {
        content: messageContent,
        messageType: "text",
      });

      if (response.data.success && response.data.message) {
        setMessages((prev) => [...prev, response.data.message]);
        setNewMessage("");

        setChats((prev) =>
          prev.map((chat) =>
            chat._id === selectedChat._id
              ? {
                  ...chat,
                  lastMessage: response.data.message,
                  lastActivity: new Date().toISOString(),
                }
              : chat
          )
        );
      }
    } catch (error: any) {
      console.error("Error sending message:", error);

      if (error.response?.status === 403) {
        setError("You are not authorized to send messages to this chat.");
      } else if (error.response?.status === 429) {
        setError("You are sending messages too quickly. Please slow down.");
      } else {
        setError("Failed to send message. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };

  const handleReaction = async (messageId: any, emoji: any) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg._id === messageId) {
          const reactions = msg.reactions || [];
          const existingReaction = reactions.find(
            (r: any) => r.emoji === emoji
          );

          if (existingReaction) {
            if (existingReaction.users.includes(user?.id)) {
              existingReaction.users = existingReaction.users.filter(
                (id: any) => id !== user?.id
              );
              return {
                ...msg,
                reactions: reactions.filter((r: any) => r.users.length > 0),
              };
            } else {
              existingReaction.users.push(user?.id);
            }
          } else {
            reactions.push({ emoji, users: [user?.id] });
          }

          return { ...msg, reactions };
        }
        return msg;
      })
    );
    setShowEmojiPicker(null);
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchChats(),
        selectedChat
          ? fetchMessages(selectedChat._id, false)
          : Promise.resolve(),
      ]);
      setError(null);
    } catch (err) {
      setError("Failed to refresh data.");
    } finally {
      setRefreshing(false);
    }
  };

  const formatTime = (date: any) => {
    if (!date) return "";
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

  const formatFileSize = (bytes: any) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getRoleIcon = (role: any) => {
    switch (role) {
      case "teacher":
        return (
          <div className="w-3 h-3 bg-blue-500 rounded-full" title="Teacher" />
        );
      case "admin":
      case "superAdmin":
        return (
          <div className="w-3 h-3 bg-red-500 rounded-full" title="Admin" />
        );
      default:
        return <User className="w-3 h-3 text-gray-500" />;
    }
  };

  const getMessageStatus = (status: any) => {
    switch (status) {
      case "sent":
        return <Clock className="w-3 h-3 text-gray-400" />;
      case "delivered":
        return <Check className="w-3 h-3 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const filteredChats = chats.filter(
    (chat) =>
      chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.class?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedMessages = messages.filter((msg) => msg.isPinned);

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-500">Loading chat interface...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex-col md:flex-row">
      {error && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white px-3 sm:px-4 py-2 text-center z-50 flex items-center justify-center gap-2 text-sm sm:text-base">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1 truncate">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 p-1 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!selectedChat && (
        <div className="md:hidden  bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 z-20 border-b border-blue-400">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">My Chats</h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      )}

      <div
        className={`fixed md:static inset-y-0 left-0 z-30 w-full sm:w-80 md:w-1/3 bg-white border-r border-gray-200 flex flex-col shadow-lg transition-transform duration-300 pt-0 md:pt-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold">My Chats</h1>
              <p className="text-blue-100 text-xs sm:text-sm truncate">
                {user?.name} • {user?.class || user?.rollNumber || "Student"}
              </p>
            </div>
            <div className="flex gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 border border-blue-300 rounded-lg placeholder-blue-200 text-white focus:outline-none focus:ring-2 focus:ring-white focus:bg-opacity-30 text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm sm:text-base">No chats found</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => {
                  setSelectedChat(chat);
                  setSidebarOpen(false);
                }}
                className={`p-3 sm:p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                  selectedChat?._id === chat._id
                    ? "bg-blue-100 border-r-4 border-r-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm sm:text-base">
                    {chat.chatType === "class" ? (
                      <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      chat.name?.charAt(0)?.toUpperCase() || "?"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                        {chat.name || "Unnamed Chat"}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTime(chat.lastActivity)}
                      </span>
                    </div>
                    {chat.lastMessage && (
                      <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">
                        <span className="font-medium">
                          {chat.lastMessage.sender?.name || "Unknown"}:
                        </span>
                        {" " + chat.lastMessage.content}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          chat.chatType === "class"
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {chat.chatType === "class"
                          ? "Class Chat"
                          : "Study Group"}
                      </span>
                      {chat.unreadCount > 0 && (
                        <span className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse flex-shrink-0">
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

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col mt-0 md:mt-0">
        {selectedChat ? (
          <>
            <div className="p-3 sm:p-4 border-b border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0  justify-between w-full">
                  
                 <div className=" flex gap-3">
                   <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 text-xs sm:text-sm">
                    {selectedChat.chatType === "class" ? (
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      selectedChat.name?.charAt(0)?.toUpperCase() || "?"
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                      {selectedChat.name || "Unnamed Chat"}
                    </h2>
                    <p className="text-xs text-gray-500 truncate">
                      {selectedChat.participants?.length || 0} members
                      {selectedChat.chatType === "class" && " • Moderated"}
                    </p>
                  </div>
                 </div>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                </div>
                {selectedChat.chatType === "class" && (
                  <div className=" items-center gap-1 flex-shrink-0 hidden sm:flex">
                    <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      <span className="hidden sm:inline">Needs approval</span>
                    </span>
                  </div>
                )}
              </div>

              {pinnedMessages.length > 0 && (
                <div className="mt-3 p-2 sm:p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Pin className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0" />
                    <span className="text-xs font-medium text-yellow-800">
                      Pinned by Teacher
                    </span>
                  </div>
                  {pinnedMessages.slice(0, 1).map((msg) => (
                    <div
                      key={msg._id}
                      className="text-xs text-gray-700 p-2 bg-white rounded border-l-4 border-yellow-400 line-clamp-2"
                    >
                      <strong>{msg.sender?.name || "Unknown"}:</strong>
                      {" " + msg.content}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
              {refreshing && (
                <div className="text-center py-2">
                  <Loader className="w-4 h-4 animate-spin text-blue-500 mx-auto" />
                </div>
              )}

              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8 sm:mt-12">
                  <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm sm:text-base">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.sender?._id === user?._id;
                  return (
                    <div
                      key={message._id}
                      className={`flex gap-2 sm:gap-3 ${
                        isOwnMessage ? "flex-row-reverse" : ""
                      } group`}
                    >
                      {!isOwnMessage && (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {message.sender?.name?.charAt(0)?.toUpperCase() ||
                            "?"}
                        </div>
                      )}
                      <div
                        className={`flex-1 max-w-xs sm:max-w-sm ${
                          isOwnMessage ? "flex flex-col items-end" : ""
                        }`}
                      >
                        {!isOwnMessage && (
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-xs sm:text-sm text-gray-900">
                              {message.sender?.name || "Unknown User"}
                            </span>
                            {getRoleIcon(message.sender?.role)}
                            <span className="text-xs text-gray-500">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                        )}

                        <div
                          className={`rounded-lg sm:rounded-2xl p-2 sm:p-3 text-sm sm:text-base ${
                            isOwnMessage
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                              : "bg-white border border-gray-200 shadow-sm"
                          }`}
                        >
                          {message.replyTo && (
                            <div className="mb-2 p-2 bg-black bg-opacity-10 rounded-lg text-xs">
                              <div className="opacity-70 mb-1">
                                Replying to:
                              </div>
                              <div className="truncate">
                                Previous message...
                              </div>
                            </div>
                          )}

                          <p
                            className={
                              isOwnMessage ? "text-white" : "text-gray-800"
                            }
                          >
                            {message.content}
                          </p>

                          {message.attachments &&
                            message.attachments.length > 0 && (
                              <div className="mt-2 sm:mt-3 space-y-2">
                                {message.attachments.map(
                                  (attachment: any, index: number) => (
                                    <div
                                      key={index}
                                      className={`p-2 sm:p-3 rounded-lg border text-xs sm:text-sm ${
                                        isOwnMessage
                                          ? "bg-white bg-opacity-20"
                                          : "bg-gray-50"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="p-1 sm:p-2 bg-red-100 rounded-lg flex-shrink-0">
                                          <FileText className="w-4 h-4 text-red-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p
                                            className={`font-medium truncate ${
                                              isOwnMessage
                                                ? "text-white"
                                                : "text-gray-900"
                                            }`}
                                          >
                                            {attachment.fileName}
                                          </p>
                                          <p
                                            className={`text-xs ${
                                              isOwnMessage
                                                ? "text-blue-100"
                                                : "text-gray-500"
                                            }`}
                                          >
                                            {formatFileSize(
                                              attachment.fileSize
                                            )}
                                          </p>
                                        </div>
                                        <button
                                          className={`p-1 sm:p-2 rounded-lg flex-shrink-0 ${
                                            isOwnMessage
                                              ? "hover:bg-white hover:bg-opacity-20"
                                              : "hover:bg-gray-100"
                                          }`}
                                        >
                                          <Download className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                        </div>

                        <div
                          className={`mt-1 flex items-center gap-1 sm:gap-2 text-xs flex-wrap ${
                            isOwnMessage ? "justify-end" : ""
                          }`}
                        >
                          {isOwnMessage && (
                            <>
                              <span className="text-gray-500">
                                {formatTime(message.createdAt)}
                              </span>
                              {getMessageStatus(message.status)}
                              {message.moderationStatus === "pending" && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                  Pending
                                </span>
                              )}
                              {message.moderationStatus === "rejected" && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                  Rejected
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {message.reactions.map(
                              (reaction: any, index: number) => (
                                <button
                                  key={index}
                                  onClick={() =>
                                    handleReaction(message._id, reaction.emoji)
                                  }
                                  className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 transition-colors ${
                                    reaction.users.includes(user?.id)
                                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  }`}
                                >
                                  <span>{reaction.emoji}</span>
                                  <span>{reaction.users.length}</span>
                                </button>
                              )
                            )}
                          </div>
                        )}

                        {!isOwnMessage &&
                          selectedChat.settings?.allowReactions && (
                            <div className="relative mt-2">
                              <button
                                onClick={() => setShowEmojiPicker(message._id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600 text-xs"
                              >
                                React
                              </button>

                              {showEmojiPicker === message._id && (
                                <div className="absolute top-6 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1 z-10">
                                  {emojis.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() =>
                                        handleReaction(message._id, emoji)
                                      }
                                      className="p-1 hover:bg-gray-100 rounded text-base sm:text-lg"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {selectedChat.chatType === "class" && (
              <div className="px-3 sm:px-4 py-2 border-t border-gray-100 bg-white overflow-x-auto">
                <div className="flex gap-2 flex-nowrap">
                  <button className="px-2 sm:px-3 py-2 bg-green-100 text-green-700 text-xs sm:text-sm rounded-lg hover:bg-green-200 flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Assignments</span>
                  </button>
                  <button className="px-2 sm:px-3 py-2 bg-blue-100 text-blue-700 text-xs sm:text-sm rounded-lg hover:bg-blue-200 flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Materials</span>
                  </button>
                  <button className="px-2 sm:px-3 py-2 bg-purple-100 text-purple-700 text-xs sm:text-sm rounded-lg hover:bg-purple-200 flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Grades</span>
                  </button>
                </div>
              </div>
            )}

            <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end gap-2">
                <button
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg flex-shrink-0"
                  disabled={
                    selectedChat.chatType === "class" &&
                    !selectedChat.settings?.allowFileSharing
                  }
                >
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      selectedChat.chatType === "class"
                        ? "Type a message... (will be reviewed)"
                        : "Type a message..."
                    }
                    className="w-full p-2 sm:p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm sm:text-base"
                    rows={1}
                    disabled={sending}
                  />
                </div>
                <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg flex-shrink-0">
                  <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="p-2 sm:p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-purple-600 flex-shrink-0"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {selectedChat.chatType === "class" && newMessage.length > 0 && (
                <div className="mt-2 text-xs text-gray-500 text-right">
                  <span
                    className={newMessage.length > 500 ? "text-red-500" : ""}
                  >
                    {newMessage.length}/500 characters
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                Welcome to Chat!
              </h3>
              <p className="text-gray-500 max-w-sm text-xs sm:text-sm">
                Select a chat from the sidebar to start chatting with your
                teachers and classmates
              </p>
            </div>
          </div>
        )}
      </div>

      {showEmojiPicker && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowEmojiPicker(null)}
        />
      )}
    </div>
  );
}
