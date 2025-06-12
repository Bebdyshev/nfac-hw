"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"

export interface Collectible {
  id: string
  x: number
  y: number
  color: string
  value: number
}

const COLLECTIBLE_COLORS = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3", "#54a0ff"]
const FIELD_WIDTH = 800
const FIELD_HEIGHT = 600
const COLLECTIBLE_RADIUS = 6

export function useCollectibles() {
  const [collectibles, setCollectibles] = useState<Collectible[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const generateCollectible = useCallback((): Collectible => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (FIELD_WIDTH - 40) + 20,
      y: Math.random() * (FIELD_HEIGHT - 40) + 20,
      color: COLLECTIBLE_COLORS[Math.floor(Math.random() * COLLECTIBLE_COLORS.length)],
      value: Math.floor(Math.random() * 5) + 1,
    }
  }, [])

  const checkCollision = useCallback(
    async (playerId: string, playerX: number, playerY: number) => {
      if (!playerId) return

      try {
        const collectedItems: string[] = []
        let totalValue = 0

        collectibles.forEach((collectible) => {
          const distance = Math.sqrt(Math.pow(playerX - collectible.x, 2) + Math.pow(playerY - collectible.y, 2))

          if (distance < COLLECTIBLE_RADIUS + 2) {
            collectedItems.push(collectible.id)
            totalValue += collectible.value
          }
        })

        if (collectedItems.length > 0) {
          // Remove collected items
          setCollectibles((prev) => prev.filter((item) => !collectedItems.includes(item.id)))

          // Update player score
          try {
            const { data: currentPlayer } = await supabase.from("players").select("score").eq("id", playerId).single()

            if (currentPlayer) {
              await supabase
                .from("players")
                .update({ score: currentPlayer.score + totalValue })
                .eq("id", playerId)
            }
          } catch (error) {
            console.error("Error updating score:", error)
          }
        }
      } catch (error) {
        console.error("Error checking collision:", error)
      }
    },
    [collectibles],
  )

  // Generate initial collectibles and maintain count
  useEffect(() => {
    const maintainCollectibles = () => {
      try {
        const targetCount = 15
        const currentCount = collectibles.length

        if (currentCount < targetCount) {
          const newCollectibles = []
          for (let i = 0; i < targetCount - currentCount; i++) {
            newCollectibles.push(generateCollectible())
          }
          setCollectibles((prev) => [...prev, ...newCollectibles])
        }
      } catch (error) {
        console.error("Error maintaining collectibles:", error)
      }
    }

    // Initial generation
    maintainCollectibles()

    // Maintain collectibles count
    intervalRef.current = setInterval(maintainCollectibles, 2000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [collectibles.length, generateCollectible])

  return { collectibles, checkCollision }
}
