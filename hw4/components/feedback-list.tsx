"use client"

import { useFeedbackStore } from "@/store/feedback-store"
import { FeedbackItem } from "./feedback-item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function FeedbackList() {
  const { getFilteredAndSortedFeedbacks } = useFeedbackStore()
  const feedbacks = getFilteredAndSortedFeedbacks()

  if (feedbacks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No feedback found. Be the first to share your ideas!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Feedback ({feedbacks.length})</CardTitle>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {feedbacks.map((feedback) => (
          <FeedbackItem key={feedback.id} feedback={feedback} />
        ))}
      </div>
    </div>
  )
}
