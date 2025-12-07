import { useEffect, useState, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

interface UseSocketOptions {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  onMessage?: (message: any) => void;
  onRoomUpdate?: (data: any) => void;
  onUserStatus?: (data: any) => void;
  onTyping?: (data: any) => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string>("");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      setConnectionError("No authentication token");
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

    const newSocket = io(socketUrl, {
      auth: { token },
      query: { token },
      extraHeaders: {
        Authorization: `Bearer ${token}`
      },
      transports: ["polling", "websocket"],
      upgrade: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      path: "/socket.io/",
      autoConnect: true,
      withCredentials: true,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      console.log("✅ Connected to server - Socket ID:", newSocket.id);
      setIsConnected(true);
      setConnectionError("");
      options.onConnect?.();
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error.message);
      setIsConnected(false);
      setConnectionError(error.message);
      options.onError?.(error);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("👋 Disconnected:", reason);
      setIsConnected(false);
      options.onDisconnect?.(reason);
    });

    newSocket.on("reconnect", () => {
      console.log("✅ Reconnected");
      setIsConnected(true);
      setConnectionError("");
    });

    newSocket.on("new-message", (message: any) => {
      console.log("📨 New message received:", message);
      options.onMessage?.(message);
    });

    newSocket.on("room-updated", (data: any) => {
      console.log("🔄 Room updated:", data);
      options.onRoomUpdate?.(data);
    });

    newSocket.on("user-status", (data: any) => {
      console.log("📊 User status:", data);
      options.onUserStatus?.(data);
    });

    newSocket.on("user-typing", (data: any) => {
      options.onTyping?.(data);
    });

    setSocket(newSocket);

    return () => {
      console.log("🧹 Cleaning up socket connection");
      newSocket.disconnect();
    };
  }, []);

  const sendTyping = useCallback((roomId: string, recipientId?: string, isTyping: boolean = true) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing", { roomId, recipientId, isTyping });
    }
  }, []);

  const sendMessageDelivered = useCallback((messageId: string, roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("message-delivered", { messageId, roomId });
    }
  }, []);

  const sendMessageRead = useCallback((messageId: string, roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("message-read", { messageId, roomId });
    }
  }, []);

  const updateStatus = useCallback((status: "online" | "offline" | "away") => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("status-update", { status });
    }
  }, []);

  return {
    socket,
    isConnected,
    connectionError,
    sendTyping,
    sendMessageDelivered,
    sendMessageRead,
    updateStatus,
  };
};