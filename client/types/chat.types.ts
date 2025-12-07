export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'superAdmin';
  avatar?: string;
  gradeId?: any;
  rollNumber?: string;
  isActive?: boolean;
}
export interface IGrade {
  _id: string;
  grade: string;
  section?: string;
  students?: string[];
}
export interface IMessageRecipient {
  userId: string;
  role: string;
  status: 'sent' | 'delivered' | 'read';
  readAt?: Date;
}
export interface IMessage {
  _id: string;
  senderId: IUser;
  recipientId?: IUser;
  content: string;
  createdAt: string;
  updatedAt?: string;
  messageType: 'unicast' | 'grade' | 'broadcast';
  isRead?: boolean;
  gradeId?: IGrade;
  recipients?: IMessageRecipient[];
}
export interface IChatParticipant {
  userId: IUser;
  role: string;
  joinedAt?: Date;
  lastReadAt?: Date;
  unreadCount?: number;
}
export interface IChatRoom {
  _id: string;
  roomType: 'direct' | 'grade' | 'broadcast';
  name: string;
  participants: IChatParticipant[];
  gradeId?: IGrade;
  lastMessage?: {
    content: string;
    senderId: IUser | string;
    sentAt: Date;
  };
  unreadCount?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt: Date;
}
export interface SendUnicastMessagePayload {
  recipientId: string;
  content: string;
}
export interface SendGradeMessagePayload {
  gradeId: string;
  content: string;
}
export interface SendBroadcastMessagePayload {
  content: string;
}
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
export interface UnreadCountResponse {
  unreadCount: number;
}