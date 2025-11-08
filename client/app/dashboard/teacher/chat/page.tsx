"use client"

import { useState, useEffect, useRef } from "react"
import {
  MessageCircle,
  Plus,
  Users,
  Search,
  Settings,
  Pin,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Shield,
  User,
  Clock,
  Check,
  CheckCheck,
  ImageIcon,
  EyeOff,
  Loader,
  AlertTriangle,
  X,
  RefreshCw,
  Menu,
} from "lucide-react"
import api from "@/lib/api"

export default function TeacherChatInterface() {
  const [user, setUser] = useState<any | null>(null)
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [chats, setChats] = useState<any[]>([])
  type Message = {
    _id: string
    sender?: { _id: string; name?: string; role?: string }
    content?: string
    createdAt?: string
    status?: string
    moderationStatus?: string
    moderationReason?: string
    moderatedBy?: string
    isPinned?: boolean
    pinnedBy?: string
  }

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showParticipants, setShowParticipants] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchingUsers, setSearchingUsers] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    initializeData()

    const interval = setInterval(() => {
      if (selectedChat) {
        fetchMessages(selectedChat._id, false)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id)
    }
  }, [selectedChat])

  const initializeData = async () => {
    try {
      setLoading(true)
      setError(null)
      await fetchUserProfile()
      await fetchChats()
    } catch (err) {
      setError("Failed to initialize application. Please refresh the page.")
      console.error("Initialization error:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/auth/profile")

      if (response.data.data.user) {
        setUser(response.data.data?.user)
        
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error: any) {
      console.error("Error fetching user profile:", error)
      if (error.response?.status === 401) {
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
      throw error
    }
  }

  const fetchChats = async () => {
    try {
      const response = await api.get("/chats")
      if (response.data.success) {
        const chatList = response.data.chats || []
        setChats(chatList)

        if (chatList.length > 0 && !selectedChat) {
          setSelectedChat(chatList[0])
        }
      }
    } catch (error: any) {
      console.error("Error fetching chats:", error)
      if (error.response?.status !== 401) {
        setError("Failed to load chats. Please try again.")
      }
    }
  }

  const fetchMessages = async (chatId: any, showLoader = true) => {
    if (!chatId) return

    try {
      if (showLoader) setRefreshing(true)
      const response = await api.get(`/chats/${chatId}/messages`)
      if (response.data.success) {
        setMessages(response.data.messages || [])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      if (showLoader) {
        setError("Failed to load messages. Please try again.")
      }
    } finally {
      if (showLoader) setRefreshing(false)
    }
  }

  const searchUsers = async (query: any) => {
    if (!query?.trim()) {
      setSearchResults([])
      return
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        setSearchingUsers(true)
        const response = await api.get(`/chats/users/search?query=${encodeURIComponent(query.trim())}`)
        if (response.data.success) {
          setSearchResults(response.data.users || [])
        }
      } catch (error) {
        console.error("Error searching users:", error)
        setSearchResults([])
      } finally {
        setSearchingUsers(false)
      }
    }, 300)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return

    const messageContent = newMessage.trim()

    try {
      setSending(true)
      setError(null)

      const response = await api.post(`/chats/${selectedChat._id}/messages`, {
        content: messageContent,
        messageType: "text",
      })

      if (response.data.success && response.data.message) {
        setMessages((prev) => [...prev, response.data.message])
        setNewMessage("")

        setChats((prev) =>
          prev.map((chat) =>
            chat._id === selectedChat._id
              ? {
                  ...chat,
                  lastMessage: response.data.message,
                  lastActivity: new Date().toISOString(),
                }
              : chat,
          ),
        )
      }
    } catch (error: any) {
      console.error("Error sending message:", error)

      if (error.response?.status === 403) {
        setError("You are not authorized to send messages to this chat.")
      } else if (error.response?.status === 429) {
        setError("You are sending messages too quickly. Please slow down.")
      } else {
        setError("Failed to send message. Please try again.")
      }
    } finally {
      setSending(false)
    }
  }

  const handleModerateMessage = async (messageId: any, action: any, reason = "") => {
    if (!messageId || !action) return

    try {
      setError(null)
      const response = await api.patch(`/chats/messages/${messageId}/moderate`, {
        action,
        reason: reason || undefined,
      })

      if (response.data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  moderationStatus: action,
                  moderatedBy: user ? user?._id : undefined,
                  moderationReason: reason,
                }
              : msg,
          ),
        )
      }
    } catch (error) {
      console.error("Error moderating message:", error)
      setError(`Failed to ${action} message. Please try again.`)
    }
  }

  const handlePinMessage = async (messageId: any) => {
    if (!messageId || !selectedChat) return

    try {
      setError(null)
      const response = await api.patch(`/chats/${selectedChat._id}/messages/${messageId}/pin`)

      if (response.data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  isPinned: !msg.isPinned,
                  pinnedBy: msg.isPinned ? undefined : user._id,
                }
              : msg,
          ),
        )
      }
    } catch (error) {
      console.error("Error pinning message:", error)
      setError("Failed to pin message. Please try again.")
    }
  }

  const handleCreatePrivateChat = async (recipientId: any, recipientName: any) => {
    if (!recipientId || !recipientName) return

    try {
      setError(null)
      const response = await api.post("/chats/private", {
        recipientId,
        name: `Chat with ${recipientName}`,
      })

      if (response.data.success && response.data.chat) {
        setChats((prev) => [response.data.chat, ...prev])
        setSelectedChat(response.data.chat)

        closeCreateModal()
      }
    } catch (error: any) {
      console.error("Error creating private chat:", error)

      if (error.response?.status === 400 && error.response.data.message?.includes("already exists")) {
        setError("A chat with this user already exists.")
      } else {
        setError("Failed to create chat. Please try again.")
      }
    }
  }

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([fetchChats(), selectedChat ? fetchMessages(selectedChat._id, false) : Promise.resolve()])
      setError(null)
    } catch (err) {
      setError("Failed to refresh data.")
    } finally {
      setRefreshing(false)
    }
  }

  const formatTime = (date: any) => {
    if (!date) return ""
    const messageDate = new Date(date)
    const now = new Date()
    const diff = now.getTime() - messageDate.getTime()

    if (diff < 60000) return "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    return messageDate.toLocaleDateString()
  }

  const getRoleIcon = (role: any) => {
    switch (role) {
      case "teacher":
        return <Shield className="w-3 h-3 text-blue-500" />
      case "admin":
      case "superAdmin":
        return <Shield className="w-3 h-3 text-red-500" />
      default:
        return <User className="w-3 h-3 text-gray-500" />
    }
  }

  const getMessageStatus = (status: any) => {
    switch (status) {
      case "sent":
        return <Clock className="w-3 h-3 text-gray-400" />
      case "delivered":
        return <Check className="w-3 h-3 text-gray-400" />
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      default:
        return null
    }
  }

  const filteredChats = chats.filter(
    (chat) =>
      chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.class?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const pendingMessages = messages.filter(
    (msg) => msg.moderationStatus === "pending" && selectedChat?.chatType === "class",
  )

  const pinnedMessages = messages.filter((msg) => msg.isPinned)

  const closeCreateModal = () => {
    setShowCreateModal(false)
    setUserSearchQuery("")
    setSearchResults([])
    setError(null)
  }

  const canModerate = (chat: any) => {
    if (!user || !chat) return false
    return (
      chat.admins?.includes(user._id) ||
      chat.moderators?.includes(user._id) ||
      ["admin", "superAdmin"].includes(user.role)
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading chat interface...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row">
      {error && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 text-center z-50 flex items-center justify-center gap-2 text-sm sm:text-base">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="ml-2 p-1 hover:bg-red-600 rounded">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}

      {
        !selectedChat && <div className="md:hidden  bg-indigo-600 text-white px-4 py-3 z-20 border-b border-indigo-500">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold truncate">Teacher Chat</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      }

      <div
        className={`fixed md:static inset-y-0 left-0 z-40 w-full sm:w-80 md:w-1/3 bg-white border-r border-gray-200 flex flex-col shadow-lg transition-transform duration-300 mt-0 md:mt-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">Teacher Chat</h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {user?.name} • Class: {user?.classTeacherFor || "N/A"}
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex-1 p-2 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-lg text-xs sm:text-sm"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 p-2 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg text-xs sm:text-sm"
              title="Start Private Chat"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" />
            </button>
            <button className="flex-1 p-2 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-lg text-xs sm:text-sm">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 sm:space-y-3">
          {filteredChats.length === 0 ? (
            <div className="text-center p-6 sm:p-8 text-gray-500">
              <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm sm:text-base">No chats found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-3 px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-600"
              >
                Start New Chat
              </button>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => {
                  setSelectedChat(chat)
                  setSidebarOpen(false)
                }}
                className={`p-2 sm:p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm sm:text-base ${
                  selectedChat?._id === chat._id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0 text-xs sm:text-sm">
                    {chat.chatType === "class" ? (
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      chat.name?.charAt(0)?.toUpperCase() || "?"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-medium text-gray-900 truncate text-xs sm:text-sm">
                        {chat.name || "Unnamed Chat"}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">{formatTime(chat.lastActivity)}</span>
                    </div>
                    {chat.lastMessage && (
                      <p className="text-xs text-gray-600 truncate mt-1">
                        <span className="font-medium">{chat.lastMessage.sender?.name || "Unknown"}:</span>
                        {chat.lastMessage.content}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2 mt-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                        {chat.chatType === "class" ? "Class Chat" : "Private"}
                      </span>
                      {canModerate(chat) && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">Moderator</span>
                      )}
                      {chat.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0">
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

      <div className="flex-1 flex flex-col mt-0 md:mt-0">
        {selectedChat ? (
          <>
            <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
                  >
                    <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0 text-xs sm:text-sm">
                    {selectedChat.chatType === "class" ? (
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      selectedChat.name?.charAt(0)?.toUpperCase() || "?"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                      {selectedChat.name || "Unnamed Chat"}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedChat.participants?.length || 0} participants • {selectedChat.chatType}
                      {canModerate(selectedChat) && " • Moderator"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  {pendingMessages.length > 0 && (
                    <span className="hidden sm:inline px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      {pendingMessages.length} pending
                    </span>
                  )}
                  <button
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg text-xs sm:text-sm"
                    title="View Participants"
                  >
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg text-xs sm:text-sm">
                    <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {pinnedMessages?.length > 0 && (
                <div className="mt-3 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs sm:text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Pin className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0" />
                    <span className="font-medium text-yellow-800">Pinned Messages</span>
                  </div>
                  {pinnedMessages.slice(0, 2).map((msg) => (
                    <div key={msg._id} className="text-gray-700 mb-1 truncate">
                      <strong>{msg.sender?.name || "Unknown"}:</strong>
                      {msg.content?.substring(0, 80)}
                      {(msg.content?.length ?? 0) > 80 && "..."}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
              {refreshing && (
                <div className="text-center py-2">
                  <Loader className="w-4 h-4 animate-spin text-blue-500 mx-auto" />
                </div>
              )}

              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm sm:text-base">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message._id} className="flex gap-2 sm:gap-3 group">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {message.sender?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap text-xs sm:text-sm">
                        <span className="font-medium text-gray-900 truncate">
                          {message.sender?.name || "Unknown User"}
                        </span>
                        {getRoleIcon(message.sender?.role)}
                        <span className="text-gray-500">{formatTime(message.createdAt)}</span>
                        {getMessageStatus(message.status)}
                        {message.isPinned && <Pin className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
                        {message.moderationStatus === "pending" && (
                          <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                            Pending Review
                          </span>
                        )}
                        {message.moderationStatus === "rejected" && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full">Rejected</span>
                        )}
                      </div>
                      <div
                        className={`rounded-lg p-2 sm:p-3 max-w-xs sm:max-w-lg text-xs sm:text-sm ${
                          message.sender?._id === user?._id
                            ? "bg-blue-500 text-white ml-auto"
                            : message.moderationStatus === "rejected"
                              ? "bg-red-50 border border-red-200"
                              : "bg-gray-100"
                        }`}
                      >
                        <p className={message.moderationStatus === "rejected" ? "text-red-700" : ""}>
                          {message.content}
                        </p>
                        {message.moderationReason && (
                          <p className="text-xs mt-1 opacity-75">Reason: {message.moderationReason}</p>
                        )}
                      </div>

                      {selectedChat.chatType === "class" &&
                        message.sender?._id !== user?._id &&
                        canModerate(selectedChat) && (
                          <div className="flex gap-1 sm:gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex-wrap">
                            {message.moderationStatus === "pending" && (
                              <>
                                <button
                                  onClick={() => handleModerateMessage(message._id, "approved")}
                                  className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt("Enter reason for rejection (optional):")
                                    handleModerateMessage(message._id, "rejected", reason as any)
                                  }}
                                  className="px-2 sm:px-3 py-0.5 sm:py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {message.moderationStatus === "approved" && (
                              <button
                                onClick={() => handlePinMessage(message._id)}
                                className="px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                              >
                                {message.isPinned ? "Unpin" : "Pin"}
                              </button>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-2 sm:p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end gap-1 sm:gap-2">
                <button className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0 text-xs sm:text-sm">
                  <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0 text-xs sm:text-sm">
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-xs sm:text-sm"
                    rows={1}
                    disabled={sending}
                  />
                </div>
                <button className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0 text-xs sm:text-sm">
                  <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="p-1.5 sm:p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {sending ? (
                    <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Select a chat</h3>
              <p className="text-gray-500 text-xs sm:text-sm">Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {showParticipants && selectedChat && (
        <div className="fixed md:relative inset-y-0 right-0 z-50 w-full sm:w-64 md:w-80 bg-white border-l border-gray-200 p-3 sm:p-4 mt-16 md:mt-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Participants</h3>
            <button onClick={() => setShowParticipants(false)} className="p-1 text-gray-500 hover:text-gray-700">
              <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          <div className="space-y-1 sm:space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
            {selectedChat.participants?.map((participant: any, i: number) => (
              <div
                key={participant._id || participant.id || i}
                className="flex items-center gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 text-xs sm:text-sm"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {participant.name?.charAt(0)?.toUpperCase() || participant.charAt?.(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{participant.name || `Participant ${i + 1}`}</p>
                  <p className="text-xs text-gray-500 capitalize">{participant.role || "Student"}</p>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" title="Online"></div>
              </div>
            )) || (
              <div className="text-center text-gray-500 py-8">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs sm:text-sm">No participants data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg sm:text-xl text-gray-900">Start Private Chat</h3>
              <button onClick={closeCreateModal} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Search for parent or colleague
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Type name or email..."
                    value={userSearchQuery}
                    onChange={(e) => {
                      setUserSearchQuery(e.target.value)
                      searchUsers(e.target.value)
                    }}
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  {searchingUsers && (
                    <Loader className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400" />
                  )}
                </div>
              </div>

              <div className="max-h-40 sm:max-h-48 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="space-y-1 sm:space-y-2">
                    {searchResults.map((searchUser: any) => (
                      <div
                        key={searchUser._id}
                        onClick={() => handleCreatePrivateChat(searchUser._id, searchUser.name)}
                        className="p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors text-xs sm:text-sm"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {searchUser.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{searchUser.name || "Unknown"}</p>
                            <p className="text-xs text-gray-500 capitalize truncate">
                              {searchUser.role || "User"}
                              {searchUser.email && ` • ${searchUser.email}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : userSearchQuery.trim() ? (
                  searchingUsers ? (
                    <div className="text-center py-6 sm:py-8">
                      <Loader className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-500 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm text-gray-500">Searching...</p>
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8 text-gray-500">
                      <Search className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs sm:text-sm">No users found</p>
                      <p className="text-xs mt-1">Try searching by name or email</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <Search className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs sm:text-sm">Start typing to search for users</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-6 flex-col-reverse sm:flex-row">
              <button
                onClick={closeCreateModal}
                className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden mt-16" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
