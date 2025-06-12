import { supabase } from "./supabase"

export interface Player {
  id: string
  name: string
  x: number
  y: number
  color: string
  score: number
  last_seen: string
}

type PlayerUpdateCallback = (players: Player[]) => void

class RealtimeManager {
  private static instance: RealtimeManager
  private channel: ReturnType<typeof supabase.channel> | null = null
  private subscribers: Set<PlayerUpdateCallback> = new Set()
  private players: Player[] = []
  private isConnected = false
  private isInitializing = false
  private initPromise: Promise<void> | null = null

  private constructor() {}

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager()
    }
    return RealtimeManager.instance
  }

  async initialize(): Promise<void> {
    // If already connected, return immediately
    if (this.isConnected) {
      return Promise.resolve()
    }

    // If currently initializing, return the existing promise
    if (this.isInitializing && this.initPromise) {
      return this.initPromise
    }

    // Start initialization
    this.isInitializing = true
    this.initPromise = this.performInitialization()

    try {
      await this.initPromise
    } finally {
      this.isInitializing = false
    }
  }

  private async performInitialization(): Promise<void> {
    try {
      console.log("Initializing realtime manager...")

      // Clean up any existing connection first
      if (this.channel) {
        console.log("Cleaning up existing channel...")
        await this.channel.unsubscribe()
        this.channel = null
        this.isConnected = false
      }

      // Fetch initial players
      console.log("Fetching initial players...")
      const { data, error } = await supabase.from("players").select("*").order("score", { ascending: false })

      if (error) throw error

      this.players = data || []
      console.log(`Loaded ${this.players.length} initial players`)

      // Create a new channel with a unique name
      const channelName = `players_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log(`Creating channel: ${channelName}`)

      this.channel = supabase.channel(channelName)

      // Set up event handlers
      this.channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "players",
          },
          (payload) => {
            console.log("Player inserted:", payload.new)
            this.players = [...this.players, payload.new as Player]
            this.notifySubscribers()
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "players",
          },
          (payload) => {
            console.log("Player updated:", payload.new)
            this.players = this.players.map((player) =>
              player.id === payload.new.id ? (payload.new as Player) : player,
            )
            this.notifySubscribers()
          },
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "players",
          },
          (payload) => {
            console.log("Player deleted:", payload.old)
            this.players = this.players.filter((player) => player.id !== payload.old.id)
            this.notifySubscribers()
          },
        )

      // Subscribe to the channel
      console.log("Subscribing to channel...")
      return new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("Subscription timeout"))
        }, 10000) // 10 second timeout

        this.channel!.subscribe((status, err) => {
          clearTimeout(timeoutId)

          console.log("Subscription status:", status, err)

          if (status === "SUBSCRIBED") {
            this.isConnected = true
            console.log("Successfully subscribed to realtime updates")
            this.notifySubscribers() // Notify with initial data
            resolve()
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            reject(new Error(`Subscription failed with status: ${status}`))
          }
        })
      })
    } catch (error) {
      console.error("Error in performInitialization:", error)

      // Clean up on error
      if (this.channel) {
        try {
          await this.channel.unsubscribe()
        } catch (cleanupError) {
          console.error("Error cleaning up channel:", cleanupError)
        }
        this.channel = null
      }

      this.isConnected = false
      throw error
    }
  }

  subscribe(callback: PlayerUpdateCallback): () => void {
    this.subscribers.add(callback)

    // Immediately call with current data
    callback([...this.players])

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
    }
  }

  private notifySubscribers() {
    const playersCopy = [...this.players]
    this.subscribers.forEach((callback) => {
      try {
        callback(playersCopy)
      } catch (error) {
        console.error("Error in subscriber callback:", error)
      }
    })
  }

  async cleanup() {
    console.log("Cleaning up realtime manager...")

    if (this.channel && this.isConnected) {
      try {
        await this.channel.unsubscribe()
        console.log("Channel unsubscribed successfully")
      } catch (error) {
        console.error("Error unsubscribing from channel:", error)
      }
    }

    this.isConnected = false
    this.isInitializing = false
    this.channel = null
    this.initPromise = null
    this.subscribers.clear()
    this.players = []
  }

  getPlayers(): Player[] {
    return [...this.players]
  }

  isReady(): boolean {
    return this.isConnected
  }
}

export const realtimeManager = RealtimeManager.getInstance()
