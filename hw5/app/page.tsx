"use client"

import { useState } from "react"
import GameField from "@/components/game-field"
import PlayerList from "@/components/player-list"
import LoginForm from "@/components/login-form"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export default function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [playerName, setPlayerName] = useState("")
  const [playerId, setPlayerId] = useState("")
  const [gameStats, setGameStats] = useState({ totalPlayers: 0, collectibles: 0 })

  const handleJoinGame = (name: string, id: string) => {
    setPlayerName(name)
    setPlayerId(id)
    setIsConnected(true)
  }

  const handleLeaveGame = async () => {
    if (playerId) {
      await supabase.from("players").delete().eq("id", playerId)
    }
    setIsConnected(false)
    setPlayerName("")
    setPlayerId("")
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Realtime Multiplayer Arena
          </h1>
          <p className="text-gray-400">Move with WASD • Collect orbs • Compete with others in real-time</p>
        </header>

        {!isConnected ? (
          <div className="flex justify-center">
            <LoginForm onJoin={handleJoinGame} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="p-4 bg-gray-800 border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">Playing as:</span>
                    <span className="font-semibold text-blue-400">{playerName}</span>
                  </div>
                  <Button
                    onClick={handleLeaveGame}
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                  >
                    Leave Game
                  </Button>
                </div>
                <GameField playerId={playerId} playerName={playerName} onStatsUpdate={setGameStats} />
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="p-4 bg-gray-800 border-gray-700">
                <h3 className="font-semibold mb-3 text-green-400">Game Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Players:</span>
                    <span className="text-white">{gameStats.totalPlayers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Collectibles:</span>
                    <span className="text-white">{gameStats.collectibles}</span>
                  </div>
                </div>
              </Card>

              <PlayerList currentPlayerId={playerId} />

              <Card className="p-4 bg-gray-800 border-gray-700">
                <h3 className="font-semibold mb-3 text-yellow-400">Controls</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>
                    <kbd className="bg-gray-700 px-2 py-1 rounded">W</kbd> Move Up
                  </div>
                  <div>
                    <kbd className="bg-gray-700 px-2 py-1 rounded">A</kbd> Move Left
                  </div>
                  <div>
                    <kbd className="bg-gray-700 px-2 py-1 rounded">S</kbd> Move Down
                  </div>
                  <div>
                    <kbd className="bg-gray-700 px-2 py-1 rounded">D</kbd> Move Right
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
