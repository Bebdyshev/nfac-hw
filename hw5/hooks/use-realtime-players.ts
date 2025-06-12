"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { realtimeManager, type Player } from "@/lib/realtime-manager"

export function useRealtimePlayers(currentPlayerId: string) {
  const [players, setPlayers] = useState<Player[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const initializationAttempted = useRef(false)
  const localPlayerPosition = useRef<{ x: number; y: number } | null>(null)

  const updatePlayerPosition = useCallback(
    async (x: number, y: number) => {
      // Store local position to prevent conflicts with remote updates
      localPlayerPosition.current = { x, y }

      // Update local state immediately for smooth movement
      setPlayers((prev) =>
        prev.map((player) =>
          player.id === currentPlayerId ? { ...player, x, y, last_seen: new Date().toISOString() } : player,
        ),
      )
    },
    [currentPlayerId],
  )

  // Initialize realtime manager and subscribe to updates
  useEffect(() => {
    if (!currentPlayerId || initializationAttempted.current) return

    initializationAttempted.current = true

    const initializeAndSubscribe = async () => {
      try {
        setError(null)
        console.log("Initializing realtime connection for player:", currentPlayerId)

        // Initialize the realtime manager
        await realtimeManager.initialize()

        // Subscribe to player updates
        const unsubscribe = realtimeManager.subscribe((updatedPlayers) => {
          setPlayers((prevPlayers) => {
            // Merge remote updates with local position for current player
            return updatedPlayers.map((player) => {
              if (player.id === currentPlayerId && localPlayerPosition.current) {
                // Use local position for current player to avoid lag
                const timeDiff = Date.now() - new Date(player.last_seen).getTime()

                // Only use remote position if it's very recent (less than 200ms old)
                if (timeDiff < 200) {
                  return {
                    ...player,
                    x: localPlayerPosition.current.x,
                    y: localPlayerPosition.current.y,
                  }
                }
              }
              return player
            })
          })
          setIsConnected(true)
        })

        unsubscribeRef.current = unsubscribe
        console.log("Successfully subscribed to player updates")
      } catch (error) {
        console.error("Error initializing realtime connection:", error)
        setError(error instanceof Error ? error.message : "Failed to connect")
        setIsConnected(false)
      }
    }

    initializeAndSubscribe()

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [currentPlayerId])

  // Cleanup disconnected players
  useEffect(() => {
    if (!currentPlayerId) return

    const cleanupInterval = setInterval(async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

      try {
        await supabase.from("players").delete().lt("last_seen", fiveMinutesAgo)
      } catch (error) {
        console.error("Error cleaning up players:", error)
      }
    }, 60000) // Check every minute

    return () => {
      clearInterval(cleanupInterval)
    }
  }, [currentPlayerId])

  // Cleanup on unmount
  useEffect(() => {
    if (!currentPlayerId) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Player is leaving, cleanup
        supabase
          .from("players")
          .delete()
          .eq("id", currentPlayerId)
          .then(() => {
            console.log("Player cleaned up on visibility change")
          })
          .catch(console.error)
      }
    }

    const handleBeforeUnload = () => {
      // Synchronous cleanup attempt
      fetch("/api/cleanup-player", {
        method: "POST",
        body: JSON.stringify({ playerId: currentPlayerId }),
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(console.error)
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)

      // Also cleanup when component unmounts
      const deletePlayer = async () => {
        try {
          await supabase.from("players").delete().eq("id", currentPlayerId)
          console.log("Player cleaned up on unmount")
        } catch (error) {
          console.error("Error deleting player on unmount:", error)
        }
      }

      deletePlayer()
    }
  }, [currentPlayerId])

  return { players, updatePlayerPosition, isConnected, error }
}

// Export the Player type for other components
export type { Player }
