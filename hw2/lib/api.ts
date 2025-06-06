import { Chat, Message } from "@/components/chat/types";

// Fetch chats from localStorage
export const getChats = async (): Promise<Chat[]> => {
  const savedChats = localStorage.getItem('chats');
  if (savedChats) {
    const parsedChats = JSON.parse(savedChats);
    return parsedChats.map((chat: any) => ({
      ...chat,
      isFavorite: chat.isFavorite || false,
      isArchived: chat.isArchived || false,
      messages: chat.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        replyTo: msg.replyTo ? { ...msg.replyTo, timestamp: new Date(msg.replyTo.timestamp) } : undefined
      }))
    }));
  }
  return [];
};

// Save chats to localStorage
export const saveChats = async (chats: Chat[]): Promise<void> => {
  localStorage.setItem('chats', JSON.stringify(chats));
};

// Send a message to the chat API
export const sendMessage = async (messageData: {
  messages: { role: string; content: string }[];
  chatId: string;
}): Promise<{ response: string }> => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messageData),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
}; 