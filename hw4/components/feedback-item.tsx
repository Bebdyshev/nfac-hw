"use client"

import { useState } from "react"
import { type Feedback, useFeedbackStore } from "@/store/feedback-store"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditFeedbackModal } from "./edit-feedback-modal"
import { ThumbsUp, MoreVertical, Edit, Trash2, Calendar, Tag } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface FeedbackItemProps {
  feedback: Feedback
}

const categoryColors = {
  UI: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Performance: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Feature: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  "Bug Fix": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function FeedbackItem({ feedback }: FeedbackItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { voteFeedback, deleteFeedback } = useFeedbackStore()

  const handleVote = () => {
    voteFeedback(feedback.id)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this feedback?")) {
      deleteFeedback(feedback.id)
    }
  }

  return (
    <>
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">{feedback.title}</h3>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={categoryColors[feedback.category]}>
                  <Tag className="w-3 h-3 mr-1" />
                  {feedback.category}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-muted-foreground mb-4">{feedback.description}</p>

          <div className="flex items-center justify-between">
            <Button
              variant={feedback.userVoted ? "default" : "outline"}
              size="sm"
              onClick={handleVote}
              className="flex items-center gap-2"
            >
              <ThumbsUp className="w-4 h-4" />
              {feedback.votes}
            </Button>

            {feedback.updatedAt !== feedback.createdAt && (
              <span className="text-xs text-muted-foreground">
                Updated {formatDistanceToNow(new Date(feedback.updatedAt), { addSuffix: true })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <EditFeedbackModal feedback={feedback} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </>
  )
}
