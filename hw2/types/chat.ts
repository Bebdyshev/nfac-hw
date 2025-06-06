export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sent' | 'read';
  replyTo?: Message;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  isPinned?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  messages: Message[];
} 