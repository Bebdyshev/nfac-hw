"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TimeDisplay } from "./TimeDisplay"
import { MessageProps } from "./types"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Components } from 'react-markdown'

export function Message({ message, chat, onReply }: MessageProps) {
  const components: Components = {
    p: ({ children }) => <p className="text-sm">{children}</p>,
    code: ({ node, inline, className, children, ...props }: { node?: any; inline?: boolean; className?: string; children: React.ReactNode }) => (
      <code className={`${inline ? 'bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded' : 'block bg-gray-100 dark:bg-gray-700 p-2 rounded my-2'} ${className || ''}`} {...props}>
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded my-2 overflow-x-auto">
        {children}
      </pre>
    ),
    ul: ({ children }) => <ul className="list-disc list-inside my-2">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside my-2">{children}</ol>,
    li: ({ children }) => <li className="text-sm">{children}</li>,
    a: ({ href, children }) => (
      <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} message-animation`}
    >
      {message.sender !== "user" && (
        <Avatar className="h-8 w-8 mr-2 mt-1">
          <AvatarFallback>{chat.avatar}</AvatarFallback>
        </Avatar>
      )}
      <div className="max-w-md">
        {message.replyTo && (
          <div className="mb-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
            <p className="font-medium">{message.replyTo.sender === 'user' ? 'You' : chat.name}</p>
            <p className="text-gray-600 dark:text-gray-300 truncate">{message.replyTo.content}</p>
          </div>
        )}
        <div
          className={`px-3 py-2 ${
            message.sender === "user"
              ? "bg-[#effdde] dark:bg-blue-600 text-gray-800 dark:text-gray-100 rounded-t-lg rounded-l-lg"
              : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-t-lg rounded-r-lg"
          }`}
        >
          {message.sender === "bot" ? (
            <div className="prose dark:prose-invert prose-sm max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={components}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm">{message.content}</p>
          )}
          <div className="flex items-center justify-end gap-1 mt-1">
            <TimeDisplay date={message.timestamp} />
            {message.sender === "user" && (
              <span className="text-xs text-gray-500">
                {message.status === 'read' ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
        {message.sender !== "user" && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 text-xs text-gray-500 hover:text-gray-700"
            onClick={() => onReply(message)}
          >
            Reply
          </Button>
        )}
      </div>
    </motion.div>
  )
} 