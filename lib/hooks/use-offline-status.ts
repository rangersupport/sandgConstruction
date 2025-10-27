"use client"

import { useState, useEffect } from "react"

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      console.log("[OfflineStatus] Back online")
      setIsOnline(true)
      setWasOffline(true)

      // Reset wasOffline after 5 seconds
      setTimeout(() => setWasOffline(false), 5000)
    }

    const handleOffline = () => {
      console.log("[OfflineStatus] Gone offline")
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return { isOnline, wasOffline }
}
