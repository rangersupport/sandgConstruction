"use client"

import { useOfflineStatus } from "@/lib/hooks/use-offline-status"
import { offlineDB } from "@/lib/offline/db"
import { useState, useEffect } from "react"
import { WifiOff, Wifi, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOfflineStatus()
  const [pendingCount, setPendingCount] = useState(0)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    loadPendingCount()

    // Listen for sync complete events
    const handleSyncComplete = () => {
      loadPendingCount()
    }

    window.addEventListener("sync-complete", handleSyncComplete)

    return () => {
      window.removeEventListener("sync-complete", handleSyncComplete)
    }
  }, [])

  useEffect(() => {
    // Show indicator when offline or when there are pending entries
    setShowIndicator(!isOnline || pendingCount > 0)
  }, [isOnline, pendingCount])

  async function loadPendingCount() {
    try {
      const count = await offlineDB.getEntryCount()
      setPendingCount(count)
    } catch (error) {
      console.error("[OfflineIndicator] Error loading pending count:", error)
    }
  }

  if (!showIndicator) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
      <Badge
        variant={isOnline ? "default" : "destructive"}
        className="flex items-center gap-2 px-3 py-2 text-sm shadow-lg"
      >
        {!isOnline && (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Offline</span>
          </>
        )}
        {isOnline && wasOffline && (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Syncing...</span>
          </>
        )}
        {isOnline && !wasOffline && pendingCount > 0 && (
          <>
            <Wifi className="w-4 h-4" />
            <span>{pendingCount} pending</span>
          </>
        )}
      </Badge>
    </div>
  )
}
