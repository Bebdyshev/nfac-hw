import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "light" | "dark"

interface ThemeState {
  theme: Theme
}

interface ThemeActions {
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  loadTheme: () => void
}

type ThemeStore = ThemeState & ThemeActions

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "light",

      setTheme: (theme) => set({ theme }),

      toggleTheme: () => {
        const { theme } = get()
        set({ theme: theme === "light" ? "dark" : "light" })
      },

      loadTheme: () => {
        // This is handled by the persist middleware
      },
    }),
    {
      name: "theme-storage",
    },
  ),
)
