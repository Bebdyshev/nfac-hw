"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { generatePlayerId, generatePlayerColor } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface LoginFormProps {
  onJoin: (name: string, id: string) => void
}

export default function LoginForm({ onJoin }: LoginFormProps) {
  const [name, setName] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsJoining(true)
    setError(null)

    try {
      const playerId = generatePlayerId()
      const color = generatePlayerColor()

      // Add player to database
      const { error: supabaseError } = await supabase.from("players").insert({
        id: playerId,
        name: name.trim(),
        x: 400, // Center of 800px field
        y: 300, // Center of 600px field
        color: color,
        score: 0,
        last_seen: new Date().toISOString(),
      })

      if (supabaseError) {
        console.error("Supabase error:", supabaseError)
        setError("Failed to join game. Please try again.")
        return
      }

      onJoin(name.trim(), playerId)
    } catch (error) {
      console.error("Error joining game:", error)
      setError("Failed to join game. Please try again.")
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-gray-800 border-gray-700">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">Join the Arena</CardTitle>
        <CardDescription className="text-gray-400">Enter your name to start playing</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            disabled={isJoining}
          />
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={!name.trim() || isJoining}>
            {isJoining ? "Joining..." : "Join Game"}
          </Button>

          {error && <div className="text-red-400 text-sm text-center mt-2">{error}</div>}
        </form>
      </CardContent>
    </Card>
  )
}
