"use client"

import { useState, useEffect } from "react"
import { useChat } from "ai/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ChatList } from "@/components/chat/ChatList"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { MessageList } from "@/components/chat/MessageList"
import { MessageInput } from "@/components/chat/MessageInput"
import { Chat, Message } from "@/components/chat/types"
import { getChats, saveChats, sendMessage } from "@/lib/api"

const mockChats: Chat[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "👩‍💻",
    lastMessage: "Hi! I'm a senior software engineer specializing in web development. How can I help you today?",
    time: new Date().toISOString(),
    unread: 0,
    online: true,
    isPinned: true,
    isFavorite: true,
    isArchived: false,
    messages: [
      {
        id: "1",
        content: "Hi! I'm a senior software engineer specializing in web development. How can I help you today?",
        sender: "bot",
        timestamp: new Date(),
      },
    ],
  },
  {
    id: "2",
    name: "Dr. Michael Rodriguez",
    avatar: "👨‍🔬",
    lastMessage: "Hello! I'm a data scientist with expertise in machine learning and AI. What would you like to discuss?",
    time: new Date().toISOString(),
    unread: 0,
    online: true,
    isFavorite: false,
    isArchived: false,
    messages: [
      {
        id: "1",
        content: "Hello! I'm a data scientist with expertise in machine learning and AI. What would you like to discuss?",
        sender: "bot",
        timestamp: new Date(),
      },
    ],
  },
  {
    id: "3",
    name: "Emma Thompson",
    avatar: "👩‍🎨",
    lastMessage: "Hi there! I'm a UX/UI designer passionate about creating beautiful and functional interfaces. How can I assist you?",
    time: new Date().toISOString(),
    unread: 0,
    online: false,
    isFavorite: false,
    isArchived: true,
    messages: [
      {
        id: "1",
        content: "Hi there! I'm a UX/UI designer passionate about creating beautiful and functional interfaces. How can I assist you?",
        sender: "bot",
        timestamp: new Date(),
      },
    ],
  },
]

function TelegramDesktopContent() {
  const [selectedChat, setSelectedChat] = useState<Chat>(mockChats[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [input, setInput] = useState("")
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [messageSearchQuery, setMessageSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const queryClient = useQueryClient()

  // Query for chats
  const { data: chats = mockChats } = useQuery({
    queryKey: ['chats'],
    queryFn: getChats,
    initialData: mockChats,
  })

  // Mutation for saving chats
  const saveChatsMutation = useMutation({
    mutationFn: saveChats,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: (data, variables) => {
      const botMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        sender: 'bot',
        timestamp: new Date(),
      }

      queryClient.setQueryData(['chats'], (oldChats: Chat[]) => {
        const newChats = oldChats.map((chat) =>
          chat.id === variables.chatId
            ? {
                ...chat,
                lastMessage: data.response,
                time: new Date().toISOString(),
                messages: [...chat.messages, botMessage],
              }
            : chat
        )
        saveChatsMutation.mutate(newChats)
        return newChats
      })

      // Update selected chat state
      setSelectedChat(prev => ({
        ...prev,
        lastMessage: data.response,
        time: new Date().toISOString(),
        messages: [...prev.messages, botMessage],
      }))
    },
  })

  // Theme handling
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  // Remove the useChat hook since we're using our own mutation
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const messageContent = input.trim()
    setInput("")
    setReplyTo(null)
    setIsLoading(true)

    const currentTime = new Date()
    const formattedTime = currentTime.toISOString()

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: 'user',
      timestamp: currentTime,
      status: 'sent',
      replyTo: replyTo || undefined
    }

    // Update local state with user message
    queryClient.setQueryData(['chats'], (oldChats: Chat[]) => {
      const newChats = oldChats.map((chat) =>
        chat.id === selectedChat.id
          ? {
              ...chat,
              lastMessage: messageContent,
              time: formattedTime,
              messages: [...chat.messages, userMessage],
            }
          : chat
      )
      saveChatsMutation.mutate(newChats)
      return newChats
    })

    setSelectedChat((prev) => ({
      ...prev,
      lastMessage: messageContent,
      time: formattedTime,
      messages: [...prev.messages, userMessage],
    }))

    const messageData = {
      messages: [
        {
          role: "system",
          content: `You are ${selectedChat.name}, a human expert in your field. ${
            selectedChat.id === "1" 
              ? "You are a senior software engineer with 10+ years of experience in web development, specializing in React, Node.js, and modern web technologies. You provide practical, code-focused solutions and best practices."
              : selectedChat.id === "2"
              ? "You are a data scientist with a PhD in Computer Science, specializing in machine learning, AI, and data analysis. You provide detailed explanations about ML concepts, algorithms, and data processing techniques."
              : "You are a UX/UI designer with extensive experience in creating user-centered designs. You provide insights about design principles, user experience, and visual aesthetics."
          } Keep your responses professional but friendly, and always stay in character as a human expert.`,
        },
        ...selectedChat.messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })),
        {
          role: "user",
          content: messageContent,
        },
      ],
      chatId: selectedChat.id,
    }

    try {
      await sendMessageMutation.mutateAsync(messageData)

      // Update message status to 'read' after bot responds
      setTimeout(() => {
        queryClient.setQueryData(['chats'], (oldChats: Chat[]) => {
          const newChats = oldChats.map((chat) =>
            chat.id === selectedChat.id
              ? {
                  ...chat,
                  messages: chat.messages.map(msg =>
                    msg.id === userMessage.id ? { ...msg, status: 'read' } : msg
                  ),
                }
              : chat
          )
          saveChatsMutation.mutate(newChats)
          return newChats
        })
      }, 1000)

    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle a chat as favorite
  const toggleFavorite = (chatId: string) => {
    queryClient.setQueryData(['chats'], (oldChats: Chat[]) => {
      const newChats = oldChats.map(chat =>
        chat.id === chatId ? { ...chat, isFavorite: !chat.isFavorite } : chat
      )
      saveChatsMutation.mutate(newChats)
      return newChats
    })
  }

  // Toggle a chat as archived
  const toggleArchive = (chatId: string) => {
    queryClient.setQueryData(['chats'], (oldChats: Chat[]) => {
      const newChats = oldChats.map(chat =>
        chat.id === chatId ? { ...chat, isArchived: !chat.isArchived } : chat
      )
      saveChatsMutation.mutate(newChats)
      return newChats
    })
  }

  // Filter chats based on search query and active filter
  const filteredChats = chats.filter((chat) => {
    let passesFilter = false;
    
    if (activeFilter === "all") {
      passesFilter = !chat.isArchived;
    } else if (activeFilter === "favorites") {
      passesFilter = !!chat.isFavorite && !chat.isArchived;
    } else if (activeFilter === "archived") {
      passesFilter = !!chat.isArchived;
    }
    
    if (!passesFilter) return false;
    
    if (!searchQuery.trim()) return true;
    
    return (
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Update selected chat when filters change
  useEffect(() => {
    const currentFilteredChats = filteredChats;
    
    if (selectedChat) {
      const isSelectedStillValid = currentFilteredChats.some(c => c.id === selectedChat.id);
      if (!isSelectedStillValid) {
        if (currentFilteredChats.length > 0) {
          setSelectedChat(currentFilteredChats[0]);
        } else {
          const fallbackList = chats.filter(c => 
            activeFilter === "archived" ? c.isArchived : !c.isArchived
          );
          if (fallbackList.length > 0) {
            setSelectedChat(fallbackList[0]);
          } else {
            setSelectedChat(chats[0]);
          }
        }
      }
    } else if (currentFilteredChats.length > 0) {
      setSelectedChat(currentFilteredChats[0]);
    }
  }, [chats, activeFilter, searchQuery, selectedChat]);

  // Filter messages based on message search query
  const filteredMessages = selectedChat.messages.filter(message =>
    message.content.toLowerCase().includes(messageSearchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <ChatList
        chats={filteredChats}
        selectedChat={selectedChat}
        searchQuery={searchQuery}
        onChatSelect={setSelectedChat}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onToggleFavorite={toggleFavorite}
        onToggleArchive={toggleArchive}
      />

      <div className="flex-1 flex flex-col relative">
        <div className={`absolute inset-0 ${theme === 'dark' ? 'telegram-bg-dark' : 'telegram-bg-light'}`}></div>
        
        <ChatHeader
          chat={selectedChat}
          messageSearchQuery={messageSearchQuery}
          onMessageSearchChange={setMessageSearchQuery}
          theme={theme}
          onThemeToggle={toggleTheme}
        />

        <MessageList
          messages={filteredMessages}
          chat={selectedChat}
          onReply={setReplyTo}
        />

        <MessageInput
          input={input}
          onInputChange={setInput}
          onSubmit={handleSendMessage}
          isLoading={isLoading}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          theme={theme}
        />
      </div>
    </div>
  )
}

export default function TelegramDesktop() {
  return (
    <TooltipProvider>
      <TelegramDesktopContent />
    </TooltipProvider>
  )
}
