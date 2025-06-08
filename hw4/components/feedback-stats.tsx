"use client"

import { useFeedbackStore } from "@/store/feedback-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ThumbsUp, TrendingUp, Tag, BarChart3 } from "lucide-react"

export function FeedbackStats() {
  const { feedbacks } = useFeedbackStore()

  const totalFeedbacks = feedbacks.length
  const totalVotes = feedbacks.reduce((sum, feedback) => sum + feedback.votes, 0)

  // Calculate this week's stats (mock calculation)
  const thisWeek = new Date()
  thisWeek.setDate(thisWeek.getDate() - 7)
  const thisWeekFeedbacks = feedbacks.filter((feedback) => new Date(feedback.createdAt) > thisWeek).length

  // Category breakdown
  const categoryStats = feedbacks.reduce(
    (acc, feedback) => {
      acc[feedback.category] = (acc[feedback.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const mostPopularCategory = Object.entries(categoryStats).sort(([, a], [, b]) => b - a)[0]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{totalFeedbacks}</div>
              <div className="text-sm text-muted-foreground">Total Ideas</div>
            </div>

            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <ThumbsUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{totalVotes}</div>
              <div className="text-sm text-muted-foreground">Total Votes</div>
            </div>
          </div>

          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">{thisWeekFeedbacks}</div>
            <div className="text-sm text-muted-foreground">This Week</div>
          </div>

          {mostPopularCategory && (
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Tag className="w-5 h-5 text-orange-600" />
              </div>
              <Badge variant="secondary" className="mb-1">
                {mostPopularCategory[0]}
              </Badge>
              <div className="text-sm text-muted-foreground">Most Popular ({mostPopularCategory[1]} ideas)</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
