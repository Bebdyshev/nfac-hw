import { create } from "zustand"
import { persist, devtools } from "zustand/middleware"

export type FeedbackCategory = "UI" | "Performance" | "Feature" | "Bug Fix"

export interface Feedback {
  id: string
  title: string
  description: string
  category: FeedbackCategory
  votes: number
  createdAt: Date
  updatedAt: Date
  userVoted: boolean
}

export type SortOption = "newest" | "oldest" | "most-voted" | "least-voted"
export type FilterOption = "all" | FeedbackCategory

interface FeedbackState {
  feedbacks: Feedback[]
  sortBy: SortOption
  filterBy: FilterOption
  searchQuery: string
}

interface FeedbackActions {
  addFeedback: (feedback: Omit<Feedback, "id" | "votes" | "createdAt" | "updatedAt" | "userVoted">) => void
  updateFeedback: (id: string, updates: Partial<Feedback>) => void
  deleteFeedback: (id: string) => void
  voteFeedback: (id: string) => void
  setSortBy: (sort: SortOption) => void
  setFilterBy: (filter: FilterOption) => void
  setSearchQuery: (query: string) => void
  getFilteredAndSortedFeedbacks: () => Feedback[]
  exportData: () => string
  importData: (data: string) => void
  loadFromStorage: () => void
}

type FeedbackStore = FeedbackState & FeedbackActions

export const useFeedbackStore = create<FeedbackStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        feedbacks: [],
        sortBy: "newest",
        filterBy: "all",
        searchQuery: "",

        // Actions
        addFeedback: (feedbackData) => {
          const newFeedback: Feedback = {
            ...feedbackData,
            id: crypto.randomUUID(),
            votes: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            userVoted: false,
          }
          set((state) => ({
            feedbacks: [...state.feedbacks, newFeedback],
          }))
        },

        updateFeedback: (id, updates) => {
          set((state) => ({
            feedbacks: state.feedbacks.map((feedback) =>
              feedback.id === id ? { ...feedback, ...updates, updatedAt: new Date() } : feedback,
            ),
          }))
        },

        deleteFeedback: (id) => {
          set((state) => ({
            feedbacks: state.feedbacks.filter((feedback) => feedback.id !== id),
          }))
        },

        voteFeedback: (id) => {
          set((state) => ({
            feedbacks: state.feedbacks.map((feedback) =>
              feedback.id === id
                ? {
                    ...feedback,
                    votes: feedback.userVoted ? feedback.votes - 1 : feedback.votes + 1,
                    userVoted: !feedback.userVoted,
                  }
                : feedback,
            ),
          }))
        },

        setSortBy: (sort) => set({ sortBy: sort }),
        setFilterBy: (filter) => set({ filterBy: filter }),
        setSearchQuery: (query) => set({ searchQuery: query }),

        getFilteredAndSortedFeedbacks: () => {
          const { feedbacks, sortBy, filterBy, searchQuery } = get()

          let filtered = feedbacks

          // Apply category filter
          if (filterBy !== "all") {
            filtered = filtered.filter((feedback) => feedback.category === filterBy)
          }

          // Apply search filter
          if (searchQuery) {
            filtered = filtered.filter(
              (feedback) =>
                feedback.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                feedback.description.toLowerCase().includes(searchQuery.toLowerCase()),
            )
          }

          // Apply sorting
          filtered.sort((a, b) => {
            switch (sortBy) {
              case "newest":
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              case "oldest":
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              case "most-voted":
                return b.votes - a.votes
              case "least-voted":
                return a.votes - b.votes
              default:
                return 0
            }
          })

          return filtered
        },

        exportData: () => {
          const { feedbacks } = get()
          return JSON.stringify(feedbacks, null, 2)
        },

        importData: (data) => {
          try {
            const importedFeedbacks = JSON.parse(data)
            if (Array.isArray(importedFeedbacks)) {
              set({ feedbacks: importedFeedbacks })
            }
          } catch (error) {
            console.error("Failed to import data:", error)
          }
        },

        loadFromStorage: () => {
          // This is handled by the persist middleware
        },
      }),
      {
        name: "feedback-storage",
        version: 1,
      },
    ),
    {
      name: "feedback-store",
    },
  ),
)
