"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FaceIcon, PaperPlaneIcon } from "@radix-ui/react-icons"
import { Mic, X } from "lucide-react"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { MessageInputProps } from "./types"

export function MessageInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  replyTo,
  onCancelReply,
  theme
}: MessageInputProps) {
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleEmojiSelect = (emoji: any) => {
    onInputChange(input + emoji.native)
    setShowEmojiPicker(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 relative z-10">
      {replyTo && (
        <div className="mb-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-between">
          <div>
            <p className="text-xs font-medium">
              Replying to {replyTo.sender === 'user' ? 'your message' : 'them'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
              {replyTo.content}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancelReply}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Input
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Message"
            className="pr-24 py-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            disabled={isLoading}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <div className="relative" ref={emojiPickerRef}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <FaceIcon className="h-4 w-4" />
              </Button>
              {showEmojiPicker && (
                <div className="absolute bottom-12 right-0">
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
                    theme={theme}
                  />
                </div>
              )}
            </div>
            {input.trim() ? (
              <Button
                type="submit"
                size="icon"
                className="h-7 w-7 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isLoading}
              >
                <PaperPlaneIcon className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                size="icon"
                className="h-7 w-7 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
} 