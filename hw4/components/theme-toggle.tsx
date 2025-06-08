"use client"

import { useThemeStore } from "@/store/theme-store"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} className="transition-colors">
      {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
