"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCheck, Star, Archive, StarIcon, ArchiveIcon } from "lucide-react"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { TimeDisplay } from "./TimeDisplay"
import { ChatListProps } from "./types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function ChatList({
  chats,
  selectedChat,
  searchQuery,
  onChatSelect,
  onSearchChange,
  activeFilter,
  onFilterChange,
  onToggleFavorite,
  onToggleArchive
}: ChatListProps) {
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  
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

      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <Tabs value={activeFilter} onValueChange={onFilterChange} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="favorites">
              <StarIcon className="h-4 w-4 mr-1" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="archived">
              <ArchiveIcon className="h-4 w-4 mr-1" />
              Archived
            </TabsTrigger>
          </TabsList>
        </Tabs>
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
                onMouseEnter={() => setHoveredChatId(chat.id)}
                onMouseLeave={() => setHoveredChatId(null)}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative ${
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
                        {chat.isPinned && <span className="ml-1">📌</span>}
                        {chat.isFavorite && <StarIcon className="inline-block h-3 w-3 ml-1 text-yellow-400" />}
                      </h3>
                      <AnimatePresence>
                        {hoveredChatId !== chat.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <TimeDisplay date={chat.time} />
                          </motion.div>
                        )}
                      </AnimatePresence>
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
                      {chat.unread > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action buttons - visible on hover */}
                {hoveredChatId === chat.id && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-gray-100 dark:bg-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(chat.id);
                          }}
                        >
                          <StarIcon 
                            className={`h-4 w-4 ${chat.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} 
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{chat.isFavorite ? 'Remove from favorites' : 'Add to favorites'}</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-gray-100 dark:bg-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleArchive(chat.id);
                          }}
                        >
                          <ArchiveIcon 
                            className={`h-4 w-4 ${chat.isArchived ? 'text-blue-500' : 'text-gray-400'}`} 
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{chat.isArchived ? 'Unarchive' : 'Archive'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  )
} 