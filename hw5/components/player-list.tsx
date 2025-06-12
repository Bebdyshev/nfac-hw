"use client"

import { useRealtimePlayers } from "@/hooks/use-realtime-players"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PlayerListProps {
  currentPlayerId: string
}

export default function PlayerList({ currentPlayerId }: PlayerListProps) {
  const { players } = useRealtimePlayers(currentPlayerId)

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-blue-400">Players ({players.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-64 overflow-y-auto">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-2 rounded ${
              player.id === currentPlayerId ? "bg-blue-900/30 border border-blue-700" : "bg-gray-700/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: player.color }} />
              <span
                className={`text-sm ${player.id === currentPlayerId ? "text-blue-300 font-semibold" : "text-gray-300"}`}
              >
                {player.name}
                {player.id === currentPlayerId && " (You)"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {index < 3 && (
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    index === 0
                      ? "border-yellow-500 text-yellow-400"
                      : index === 1
                        ? "border-gray-400 text-gray-300"
                        : "border-orange-500 text-orange-400"
                  }`}
                >
                  #{index + 1}
                </Badge>
              )}
              <span className="text-xs text-gray-400">{player.score}</span>
            </div>
          </div>
        ))}
        {players.length === 0 && <div className="text-center text-gray-500 py-4">No other players online</div>}
      </CardContent>
    </Card>
  )
}
