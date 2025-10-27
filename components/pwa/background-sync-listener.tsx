"use client"

import { useEffect } from "react"
import { syncManager } from "@/lib/offline/sync-manager"
import { useOfflineStatus } from "@/lib/hooks/use-offline-status"

export function BackgroundSyncListener() {
  const { isOnline } = useOfflineStatus()

  useEffect(() => {
    // Register background sync when service worker is ready
    if ("serviceWorker" in navigator && "sync" in ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        console.log("[BackgroundSync] Service worker ready, registering sync")

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data.type === "SYNC_COMPLETE") {
            console.log("[BackgroundSync] Sync complete:", event.data.count, "entries")
            // Trigger a page refresh or update UI
            window.dispatchEvent(new CustomEvent("sync-complete", { detail: event.data }))
          }
        })
      })
    }

    // Trigger sync when coming back online
    if (isOnline) {
      console.log("[BackgroundSync] Online detected, triggering sync")
      triggerBackgroundSync()
    }
  }, [isOnline])

  return null
}

async function triggerBackgroundSync() {
  if ("serviceWorker" in navigator && "sync" in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register("sync-time-entries")
      console.log("[BackgroundSync] Background sync registered")
    } catch (error) {
      console.error("[BackgroundSync] Failed to register background sync:", error)
      // Fallback to manual sync
      console.log("[BackgroundSync] Falling back to manual sync")
      await syncManager.syncPendingEntries()
    }
  } else {
    // Browser doesn't support background sync, use manual sync
    console.log("[BackgroundSync] Background sync not supported, using manual sync")
    await syncManager.syncPendingEntries()
  }
}
