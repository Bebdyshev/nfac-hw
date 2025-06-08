"use client"

import { useState, useEffect } from "react"
import { TimeDisplayProps } from "./types"

export function TimeDisplay({ date }: TimeDisplayProps) {
  const [time, setTime] = useState("")

  useEffect(() => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (!isNaN(dateObj.getTime())) {
      setTime(dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    }
  }, [date])

  return <span className="text-xs text-gray-500 dark:text-gray-400">{time}</span>
} 