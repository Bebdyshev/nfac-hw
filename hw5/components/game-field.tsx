"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { usePlayerMovement } from "@/hooks/use-player-movement"
import { useRealtimePlayers } from "@/hooks/use-realtime-players"
import { useCollectibles } from "@/hooks/use-collectibles"
import { Button } from "@/components/ui/button"

const FIELD_WIDTH = 800
const FIELD_HEIGHT = 600
const PLAYER_SIZE = 4
const MINIMAP_SIZE = 120
const TRAIL_LENGTH = 8 // Reduced trail length
const TRAIL_UPDATE_INTERVAL = 100 // Update trails less frequently

interface GameFieldProps {
  playerId: string
  playerName: string
  onStatsUpdate: (stats: { totalPlayers: number; collectibles: number }) => void
}

export default function GameField({ playerId, playerName, onStatsUpdate }: GameFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const minimapRef = useRef<HTMLCanvasElement>(null)
  const [playerTrails, setPlayerTrails] = useState<
    Map<string, Array<{ x: number; y: number; alpha: number; timestamp: number }>>
  >(new Map())
  const animationRef = useRef<number | null>(null)
  const lastTrailUpdate = useRef<number>(0)
  const lastPlayerPositions = useRef<Map<string, { x: number; y: number }>>(new Map())

  const { players, updatePlayerPosition, isConnected, error } = useRealtimePlayers(playerId)
  const { collectibles, checkCollision } = useCollectibles()

  usePlayerMovement(playerId, (x, y) => {
    updatePlayerPosition(x, y)
    checkCollision(playerId, x, y)
  })

  // Update stats
  useEffect(() => {
    onStatsUpdate({
      totalPlayers: players.length,
      collectibles: collectibles.length,
    })
  }, [players.length, collectibles.length, onStatsUpdate])

  // Update player trails with throttling
  useEffect(() => {
    const now = Date.now()

    // Only update trails every TRAIL_UPDATE_INTERVAL ms
    if (now - lastTrailUpdate.current < TRAIL_UPDATE_INTERVAL) {
      return
    }

    lastTrailUpdate.current = now

    try {
      const newTrails = new Map(playerTrails)

      players.forEach((player) => {
        const lastPos = lastPlayerPositions.current.get(player.id)

        // Only add trail point if player has moved significantly
        if (!lastPos || Math.abs(lastPos.x - player.x) > 2 || Math.abs(lastPos.y - player.y) > 2) {
          if (!newTrails.has(player.id)) {
            newTrails.set(player.id, [])
          }

          const trail = newTrails.get(player.id)!
          trail.push({ x: player.x, y: player.y, alpha: 1, timestamp: now })

          // Keep only recent trail points
          while (trail.length > TRAIL_LENGTH) {
            trail.shift()
          }

          // Remove old trail points (older than 2 seconds)
          const cutoffTime = now - 2000
          while (trail.length > 0 && trail[0].timestamp < cutoffTime) {
            trail.shift()
          }

          // Update fade based on age
          trail.forEach((point, index) => {
            const age = now - point.timestamp
            const maxAge = 2000 // 2 seconds
            point.alpha = Math.max(0, (1 - age / maxAge) * 0.4) // Max alpha of 0.4
          })

          lastPlayerPositions.current.set(player.id, { x: player.x, y: player.y })
        }
      })

      // Remove trails for players that no longer exist
      const currentPlayerIds = new Set(players.map((p) => p.id))
      for (const [playerId] of newTrails) {
        if (!currentPlayerIds.has(playerId)) {
          newTrails.delete(playerId)
          lastPlayerPositions.current.delete(playerId)
        }
      }

      setPlayerTrails(newTrails)
    } catch (error) {
      console.error("Error updating player trails:", error)
    }
  }, [players, playerTrails])

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current
    const minimap = minimapRef.current
    if (!canvas || !minimap) return

    const ctx = canvas.getContext("2d")
    const minimapCtx = minimap.getContext("2d")
    if (!ctx || !minimapCtx) return

    try {
      // Clear canvases
      ctx.fillStyle = "#1a1a1a"
      ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT)

      minimapCtx.fillStyle = "#2a2a2a"
      minimapCtx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE)

      // Draw grid
      ctx.strokeStyle = "#333"
      ctx.lineWidth = 1
      for (let i = 0; i <= FIELD_WIDTH; i += 40) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, FIELD_HEIGHT)
        ctx.stroke()
      }
      for (let i = 0; i <= FIELD_HEIGHT; i += 40) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(FIELD_WIDTH, i)
        ctx.stroke()
      }

      // Show connection error overlay
      if (error) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
        ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT)

        ctx.fillStyle = "#ff6b6b"
        ctx.font = "24px Arial"
        ctx.textAlign = "center"
        ctx.fillText("Connection Error", FIELD_WIDTH / 2, FIELD_HEIGHT / 2 - 20)

        ctx.fillStyle = "#ffffff"
        ctx.font = "14px Arial"
        ctx.fillText("Check console for details", FIELD_WIDTH / 2, FIELD_HEIGHT / 2 + 10)
        return
      }

      // Show connecting overlay
      if (!isConnected) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
        ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT)

        ctx.fillStyle = "#4ecdc4"
        ctx.font = "24px Arial"
        ctx.textAlign = "center"
        ctx.fillText("Connecting...", FIELD_WIDTH / 2, FIELD_HEIGHT / 2)
        return
      }

      // Draw collectibles
      collectibles.forEach((collectible) => {
        // Main canvas
        ctx.fillStyle = collectible.color
        ctx.beginPath()
        ctx.arc(collectible.x, collectible.y, 6, 0, Math.PI * 2)
        ctx.fill()

        // Glow effect
        ctx.shadowColor = collectible.color
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(collectible.x, collectible.y, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Minimap
        const minimapX = (collectible.x / FIELD_WIDTH) * MINIMAP_SIZE
        const minimapY = (collectible.y / FIELD_HEIGHT) * MINIMAP_SIZE
        minimapCtx.fillStyle = collectible.color
        minimapCtx.fillRect(minimapX - 1, minimapY - 1, 2, 2)
      })

      // Draw player trails (only for other players to reduce visual noise)
      playerTrails.forEach((trail, id) => {
        if (id === playerId) return // Skip current player's trail

        const player = players.find((p) => p.id === id)
        if (!player || trail.length === 0) return

        trail.forEach((point) => {
          if (point.alpha > 0.05) {
            // Only draw visible trail points
            ctx.fillStyle =
              player.color +
              Math.floor(point.alpha * 255)
                .toString(16)
                .padStart(2, "0")
            ctx.fillRect(point.x - 1, point.y - 1, 2, 2)
          }
        })
      })

      // Draw players
      players.forEach((player) => {
        const isCurrentPlayer = player.id === playerId

        // Main canvas
        ctx.fillStyle = player.color
        if (isCurrentPlayer) {
          // Add glow for current player
          ctx.shadowColor = player.color
          ctx.shadowBlur = 8
        }
        ctx.fillRect(player.x - PLAYER_SIZE / 2, player.y - PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE)
        ctx.shadowBlur = 0

        // Player name
        ctx.fillStyle = "white"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.fillText(player.name || "Player", player.x, player.y - 10)

        // Score
        if (player.score > 0) {
          ctx.fillStyle = "#ffd700"
          ctx.font = "10px Arial"
          ctx.fillText(`${player.score}`, player.x, player.y + 15)
        }

        // Minimap
        const minimapX = (player.x / FIELD_WIDTH) * MINIMAP_SIZE
        const minimapY = (player.y / FIELD_HEIGHT) * MINIMAP_SIZE
        minimapCtx.fillStyle = player.color
        if (isCurrentPlayer) {
          minimapCtx.fillRect(minimapX - 2, minimapY - 2, 4, 4)
          minimapCtx.strokeStyle = "white"
          minimapCtx.strokeRect(minimapX - 3, minimapY - 3, 6, 6)
        } else {
          minimapCtx.fillRect(minimapX - 1, minimapY - 1, 2, 2)
        }
      })
    } catch (error) {
      console.error("Error drawing game:", error)
    }
  }, [players, collectibles, playerId, playerTrails, isConnected, error])

  useEffect(() => {
    const animate = () => {
      drawGame()
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [drawGame])

  const handleRetryConnection = () => {
    window.location.reload()
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={FIELD_WIDTH}
        height={FIELD_HEIGHT}
        className="border border-gray-600 rounded-lg bg-gray-900"
        tabIndex={0}
      />

      {/* Connection Status */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-gray-800/80 rounded px-2 py-1 text-xs">
        <div
          className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : error ? "bg-red-400" : "bg-yellow-400"}`}
        />
        <span className="text-gray-300">{error ? "Error" : isConnected ? "Connected" : "Connecting..."}</span>
        {error && (
          <Button onClick={handleRetryConnection} size="sm" variant="outline" className="ml-2 h-6 text-xs">
            Retry
          </Button>
        )}
      </div>

      {/* Performance Info */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800/80 rounded px-2 py-1 text-xs text-gray-300">
        Players: {players.length} | Collectibles: {collectibles.length}
      </div>

      {/* Minimap */}
      <div className="absolute top-4 right-4 border border-gray-600 rounded bg-gray-800/80 p-2">
        <div className="text-xs text-gray-400 mb-1">Minimap</div>
        <canvas
          ref={minimapRef}
          width={MINIMAP_SIZE}
          height={MINIMAP_SIZE}
          className="border border-gray-700 rounded"
        />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-gray-800/80 rounded p-2 text-xs text-gray-300">
        Use WASD to move • Collect glowing orbs to score points
      </div>
    </div>
  )
}
