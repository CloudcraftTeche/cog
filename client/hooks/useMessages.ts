'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { toast } from 'sonner';
import api from '@/lib/api'; 

export const useMessages = (chatId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { socket, isConnected } = useSocket();

  const API_BASE = '/chats'; 

  const loadMessages = useCallback(
    async (pageNumber: number = 1, append: boolean = false) => {
      if (!chatId) return;

      setLoading(true);
      try {
        const response = await api.get(`${API_BASE}/${chatId}`, {
          params: { page: pageNumber, limit: 50 },
        });

        const data = response.data?.data || [];

        if (append) {
          setMessages((prev) => [...data, ...prev]);
        } else {
          setMessages(data.reverse());
        }

        setHasMore(data.length === 50);
      } catch (error) {
        console.error('Failed to load messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    },
    [chatId]
  );

  const loadMoreMessages = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadMessages(nextPage, true);
  }, [page, hasMore, loading, loadMessages]);

  const sendMessage = useCallback(
    async (content: string, files?: File[]) => {
      if (!isConnected || !socket || (!content.trim() && !files?.length)) return;

      try {
        const formData = new FormData();
        formData.append('chatId', chatId);
        formData.append('content', content);
        if (files) {
          files.forEach((file) => formData.append('attachments', file));
        }

        await api.post(API_BASE, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch (error) {
        console.error('Failed to send message:', error);
        toast.error('Failed to send message');
        throw error;
      }
    },
    [chatId, isConnected, socket]
  );

  const reactToMessage = useCallback(async (messageId: string, emoji: string) => {
    try {
      await api.patch(`${API_BASE}/${messageId}/react`, { emoji });
    } catch (error) {
      console.error('Failed to react to message:', error);
      toast.error('Failed to react to message');
    }
  }, []);

  const pinMessage = useCallback(async (messageId: string) => {
    try {
      await api.patch(`${API_BASE}/${messageId}/pin`);
      toast.success('Message pinned');
    } catch (error) {
      console.error('Failed to pin message:', error);
      toast.error('Failed to pin message');
    }
  }, []);

  // socket event handlers
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (data: { message: any; sender: any }) => {
      if (data.message.chat === chatId) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    const handleMessageReaction = (data: any) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId ? { ...msg, reactions: data.reactions } : msg
        )
      );
    };

    const handleMessagePinned = (data: { messageId: string; pinnedBy: any }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, isPinned: true, pinnedBy: data.pinnedBy }
            : msg
        )
      );
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_reaction', handleMessageReaction);
    socket.on('message_pinned', handleMessagePinned);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_reaction', handleMessageReaction);
      socket.off('message_pinned', handleMessagePinned);
    };
  }, [socket, isConnected, chatId]);

  useEffect(() => {
    if (chatId) {
      setMessages([]);
      setPage(1);
      setHasMore(true);
      loadMessages(1);
    }
  }, [chatId, loadMessages]);

  return {
    messages,
    loading,
    hasMore,
    sendMessage,
    reactToMessage,
    pinMessage,
    loadMoreMessages,
    loadMessages,
  };
};
