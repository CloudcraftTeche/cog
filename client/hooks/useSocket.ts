import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    if (this.socket?.connected) return this.socket;

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  joinChats(chatIds: string[]) {
    this.socket?.emit('join-chats', chatIds);
  }

  leaveChat(chatId: string) {
    this.socket?.emit('leave-chat', chatId);
  }

  sendMessage(data: any) {
    this.socket?.emit('send-message', data);
  }

  onNewMessage(callback: (data: any) => void) {
    this.socket?.on('new-message', callback);
  }

  offNewMessage() {
    this.socket?.off('new-message');
  }

  startTyping(chatId: string, userId: string, userName: string) {
    this.socket?.emit('typing-start', { chatId, userId, userName });
  }

  stopTyping(chatId: string, userId: string) {
    this.socket?.emit('typing-stop', { chatId, userId });
  }

  onUserTyping(callback: (data: { userId: string; userName: string }) => void) {
    this.socket?.on('user-typing', callback);
  }

  onUserStoppedTyping(callback: (data: { userId: string }) => void) {
    this.socket?.on('user-stopped-typing', callback);
  }

  offTypingEvents() {
    this.socket?.off('user-typing');
    this.socket?.off('user-stopped-typing');
  }

  onMessageModerated(callback: (data: any) => void) {
    this.socket?.on('message-moderated', callback);
  }

  offMessageModerated() {
    this.socket?.off('message-moderated');
  }

  // User status
  setUserOnline(userId: string) {
    this.socket?.emit('user-online', userId);
  }

  onUserStatusChange(callback: (data: { userId: string; status: 'online' | 'offline' }) => void) {
    this.socket?.on('user-status-change', callback);
  }

  offUserStatusChange() {
    this.socket?.off('user-status-change');
  }

  onMessageError(callback: (error: any) => void) {
    this.socket?.on('message-error', callback);
  }
}

export const socketService = new SocketService();