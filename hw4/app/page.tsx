"use client"

import { useEffect } from "react"
import { useFeedbackStore } from "@/store/feedback-store"
import { useThemeStore } from "@/store/theme-store"
import { FeedbackForm } from "@/components/feedback-form"
import { FeedbackList } from "@/components/feedback-list"
import { FeedbackFilters } from "@/components/feedback-filters"
import { FeedbackStats } from "@/components/feedback-stats"
import { ThemeToggle } from "@/components/theme-toggle"
import { ExportImport } from "@/components/export-import"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const { loadFromStorage } = useFeedbackStore()
  const { theme, loadTheme } = useThemeStore()

  useEffect(() => {
    loadFromStorage()
    loadTheme()
  }, [loadFromStorage, loadTheme])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  return (
    <div className="min-h-screen bg-background transition-colors">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Product Feedback Board</h1>
            <p className="text-muted-foreground">Share your ideas and vote on suggestions to improve our product</p>
          </div>
          <div className="flex items-center gap-4">
            <ExportImport />
            <ThemeToggle />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form and Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <FeedbackForm />
              </CardContent>
            </Card>

            <FeedbackStats />
          </div>

          {/* Right Column - Filters and List */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Filter & Sort</CardTitle>
              </CardHeader>
              <CardContent>
                <FeedbackFilters />
              </CardContent>
            </Card>

            <FeedbackList />
          </div>
        </div>
      </div>
    </div>
  )
}
