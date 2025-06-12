"use client"

import { useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"

const FIELD_WIDTH = 800
const FIELD_HEIGHT = 600
const PLAYER_SIZE = 4
const MOVE_SPEED = 3
const UPDATE_THROTTLE = 100 // Update database every 100ms instead of 50ms

export function usePlayerMovement(playerId: string, onPositionChange: (x: number, y: number) => void) {
  const keysPressed = useRef<Set<string>>(new Set())
  const currentPosition = useRef({ x: 400, y: 300 })
  const lastUpdateTime = useRef(Date.now())
  const lastDbUpdateTime = useRef(Date.now())
  const movementIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pendingUpdate = useRef<{ x: number; y: number } | null>(null)

  const updateDatabase = useCallback(
    async (x: number, y: number) => {
      if (!playerId) return

      try {
        await supabase
          .from("players")
          .update({
            x: Math.round(x),
            y: Math.round(y),
            last_seen: new Date().toISOString(),
          })
          .eq("id", playerId)
      } catch (error) {
        console.error("Error updating position:", error)
      }
    },
    [playerId],
  )

  const updatePosition = useCallback(
    (newX: number, newY: number) => {
      if (!playerId) return

      // Boundary checking
      const clampedX = Math.max(PLAYER_SIZE / 2, Math.min(FIELD_WIDTH - PLAYER_SIZE / 2, newX))
      const clampedY = Math.max(PLAYER_SIZE / 2, Math.min(FIELD_HEIGHT - PLAYER_SIZE / 2, newY))

      currentPosition.current = { x: clampedX, y: clampedY }

      // Always update local position immediately for smooth movement
      onPositionChange(clampedX, clampedY)

      // Throttle database updates
      const now = Date.now()
      if (now - lastDbUpdateTime.current > UPDATE_THROTTLE) {
        lastDbUpdateTime.current = now
        updateDatabase(clampedX, clampedY)
        pendingUpdate.current = null
      } else {
        // Store pending update to send later
        pendingUpdate.current = { x: clampedX, y: clampedY }
      }
    },
    [playerId, onPositionChange, updateDatabase],
  )

  const handleMovement = useCallback(() => {
    const now = Date.now()
    const deltaTime = now - lastUpdateTime.current
    lastUpdateTime.current = now

    // Normalize movement speed based on frame time
    const speedMultiplier = Math.min(deltaTime / 16, 2) // Cap at 2x speed for very slow frames

    let deltaX = 0
    let deltaY = 0

    if (keysPressed.current.has("w")) deltaY -= MOVE_SPEED * speedMultiplier
    if (keysPressed.current.has("s")) deltaY += MOVE_SPEED * speedMultiplier
    if (keysPressed.current.has("a")) deltaX -= MOVE_SPEED * speedMultiplier
    if (keysPressed.current.has("d")) deltaX += MOVE_SPEED * speedMultiplier

    if (deltaX !== 0 || deltaY !== 0) {
      const newX = currentPosition.current.x + deltaX
      const newY = currentPosition.current.y + deltaY
      updatePosition(newX, newY)
    }
  }, [updatePosition])

  // Send any pending updates periodically
  useEffect(() => {
    const pendingUpdateInterval = setInterval(() => {
      if (pendingUpdate.current && playerId) {
        updateDatabase(pendingUpdate.current.x, pendingUpdate.current.y)
        pendingUpdate.current = null
      }
    }, UPDATE_THROTTLE)

    return () => clearInterval(pendingUpdateInterval)
  }, [playerId, updateDatabase])

  useEffect(() => {
    if (!playerId) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (["w", "a", "s", "d"].includes(key)) {
        e.preventDefault()
        keysPressed.current.add(key)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (["w", "a", "s", "d"].includes(key)) {
        e.preventDefault()
        keysPressed.current.delete(key)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    // Movement loop at 60 FPS
    movementIntervalRef.current = setInterval(handleMovement, 16)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      if (movementIntervalRef.current) {
        clearInterval(movementIntervalRef.current)
      }
    }
  }, [handleMovement, playerId])

  // Initialize position
  useEffect(() => {
    if (!playerId) return

    const initializePosition = async () => {
      try {
        const { data } = await supabase.from("players").select("x, y").eq("id", playerId).single()

        if (data) {
          currentPosition.current = { x: data.x, y: data.y }
          onPositionChange(data.x, data.y)
        }
      } catch (error) {
        console.error("Error fetching initial position:", error)
      }
    }

    initializePosition()
  }, [playerId, onPositionChange])
}
