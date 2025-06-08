export interface Chat {
  id: string
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread: number
  online: boolean
  isBot?: boolean
  isPinned?: boolean
  isFavorite?: boolean
  isArchived?: boolean
  messages: Message[]
}

export interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  status?: 'sent' | 'read'
  replyTo?: Message
}

export interface TimeDisplayProps {
  date: Date | string
}

export interface ChatListProps {
  chats: Chat[]
  selectedChat: Chat
  searchQuery: string
  onChatSelect: (chat: Chat) => void
  onSearchChange: (query: string) => void
  activeFilter: string
  onFilterChange: (filter: string) => void
  onToggleFavorite: (chatId: string) => void
  onToggleArchive: (chatId: string) => void
}

export interface ChatHeaderProps {
  chat: Chat
  messageSearchQuery: string
  onMessageSearchChange: (query: string) => void
  theme: 'light' | 'dark'
  onThemeToggle: () => void
}

export interface MessageListProps {
  messages: Message[]
  chat: Chat
  onReply: (message: Message) => void
}

export interface MessageProps {
  message: Message
  chat: Chat
  onReply: (message: Message) => void
}

export interface MessageInputProps {
  input: string
  onInputChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  replyTo: Message | null
  onCancelReply: () => void
  theme: 'light' | 'dark'
} 