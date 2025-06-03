"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCheck, Sun, Moon } from "lucide-react"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { TimeDisplay } from "./TimeDisplay"
import { ChatListProps } from "./types"

export function ChatList({
  chats,
  selectedChat,
  searchQuery,
  onChatSelect,
  onSearchChange,
}: ChatListProps) {
  return (
    <div className="w-[320px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-9 bg-gray-100 dark:bg-gray-700 border-0 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-0.5">
          <AnimatePresence>
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onClick={() => onChatSelect(chat)}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  selectedChat.id === chat.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="text-sm">{chat.avatar}</AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                        {chat.name}
                      </h3>
                      <TimeDisplay date={chat.time} />
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <div className="flex items-center gap-1 min-w-0">
                        {chat.id === "1" && (
                          <CheckCheck className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                          {chat.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  )
} 