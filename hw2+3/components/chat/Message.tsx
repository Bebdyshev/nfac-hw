"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TimeDisplay } from "./TimeDisplay"
import { MessageProps } from "./types"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { ReplyIcon, CheckIcon, CheckCheckIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Components } from 'react-markdown'
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter'

interface CodeComponentProps extends React.ComponentPropsWithoutRef<'code'> {
  node?: any
  inline?: boolean
}

export function Message({ message, chat, onReply }: MessageProps) {
  const [isHovered, setIsHovered] = useState(false)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} message-animation`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
                components={{
                  code: ({ node, inline, className, children, ...props }: CodeComponentProps) => {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus as any}
                        language={match[1]}
                        PreTag="div"
                        {...(props as SyntaxHighlighterProps)}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
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
                {message.status === 'sent' ? (
                  <CheckIcon className="h-3 w-3" />
                ) : message.status === 'read' ? (
                  <CheckCheckIcon className="h-3 w-3" />
                ) : null}
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
      {isHovered && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute -left-10 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => onReply(message)}
            >
              <ReplyIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reply</p>
          </TooltipContent>
        </Tooltip>
      )}
    </motion.div>
  )
} 