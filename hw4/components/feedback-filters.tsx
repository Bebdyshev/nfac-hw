"use client"

import { useFeedbackStore, type SortOption, type FilterOption } from "@/store/feedback-store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Filter, ArrowUpDown } from "lucide-react"

export function FeedbackFilters() {
  const { sortBy, filterBy, searchQuery, setSortBy, setFilterBy, setSearchQuery } = useFeedbackStore()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="search" className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          Search
        </Label>
        <Input
          id="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search feedback..."
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter by Category
        </Label>
        <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="UI">UI</SelectItem>
            <SelectItem value="Performance">Performance</SelectItem>
            <SelectItem value="Feature">Feature</SelectItem>
            <SelectItem value="Bug Fix">Bug Fix</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4" />
          Sort by
        </Label>
        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="most-voted">Most Voted</SelectItem>
            <SelectItem value="least-voted">Least Voted</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
