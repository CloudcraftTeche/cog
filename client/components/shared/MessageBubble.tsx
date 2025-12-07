import React from "react";
import { Clock, Check, CheckCheck } from "lucide-react";
import { IMessage } from "@/types/chat.types";
import { formatTime } from "@/utils/chatHelpers";

interface MessageBubbleProps {
  message: IMessage;
  isOwnMessage: boolean;
  showSender?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showSender = true,
}) => {
  const getStatusIcon = () => {
    if (!isOwnMessage) return null;

    const recipient = message.recipients?.[0];
    if (!recipient) return <Check className="w-3 h-3" />;

    switch (recipient.status) {
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-400" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3" />;
      default:
        return <Check className="w-3 h-3" />;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[85%] sm:max-w-xl">
        <div
          className={`rounded-2xl p-3 sm:p-4 shadow-md ${
            isOwnMessage
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
              : "bg-white text-gray-800 border border-gray-200"
          }`}
        >
          {!isOwnMessage && showSender && (
            <div className="text-xs font-semibold mb-2 text-blue-600">
              {message.senderId.name}
            </div>
          )}
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </p>
          <div className="flex items-center gap-2 text-xs mt-2 opacity-70">
            <Clock className="w-3 h-3" />
            {formatTime(message.createdAt)}
            {getStatusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
};
