"use client"

import { useRef, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Message } from "./Message"
import { MessageListProps } from "./types"

export function MessageList({ messages, chat, onReply }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <ScrollArea className="flex-1 p-4 relative z-10">
      <div className="max-w-3xl mx-auto space-y-3">
        <AnimatePresence>
          {messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              chat={chat}
              onReply={onReply}
            />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
} 