"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Phone, MoreVertical, Sun, Moon, Search } from "lucide-react"
import { ChatHeaderProps } from "./types"

export function ChatHeader({ chat, messageSearchQuery, onMessageSearchChange, theme, onThemeToggle }: ChatHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between relative z-10">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>{chat.avatar}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium text-gray-900 dark:text-gray-100">{chat.name}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {chat.online ? "online" : "last seen recently"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative group rounded-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
          <Input
            placeholder="Search messages..."
            value={messageSearchQuery}
            onChange={(e) => onMessageSearchChange(e.target.value)}
            className="w-48 h-8 pl-9 text-sm bg-gray-100 dark:bg-gray-700 border-0 focus:bg-white dark:focus:bg-gray-600 dark:text-gray-100 transition-colors"
          />
          {messageSearchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute inset-y-0 right-0 h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              onClick={() => onMessageSearchChange("")}
            >
              <span className="sr-only">Clear search</span>
              ×
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          onClick={onThemeToggle}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 dark:text-gray-400">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 dark:text-gray-400">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 