"use client"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-6xl">📡</div>
        <h1 className="text-2xl font-bold">You're Offline</h1>
        <p className="text-muted-foreground">
          No internet connection detected. Your clock-in/out actions will be saved and synced when you're back online.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
