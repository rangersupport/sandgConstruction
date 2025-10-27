"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Share, Plus, Smartphone } from "lucide-react"

export function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)

    // Check if already installed (running in standalone mode)
    const isInStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true

    setIsIOS(isIOSDevice)
    setIsStandalone(isInStandaloneMode)

    // Show prompt after 10 seconds if iOS and not installed
    if (isIOSDevice && !isInStandaloneMode) {
      const dismissed = localStorage.getItem("ios-install-dismissed")
      const dismissedTime = dismissed ? Number.parseInt(dismissed) : 0
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)

      if (daysSinceDismissed > 7 || !dismissed) {
        const timer = setTimeout(() => {
          setShowPrompt(true)
        }, 10000) // Show after 10 seconds

        return () => clearTimeout(timer)
      }
    }
  }, [])

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("ios-install-dismissed", Date.now().toString())
  }

  if (!isIOS || isStandalone || !showPrompt) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md animate-in slide-in-from-bottom-5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Install Time Clock App</CardTitle>
                <CardDescription>Add to your home screen for quick access</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <p className="font-medium">To install this app:</p>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                1
              </div>
              <div className="flex-1">
                <p>
                  Tap the <Share className="inline h-4 w-4 mx-1" /> <strong>Share</strong> button below
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                2
              </div>
              <div className="flex-1">
                <p>
                  Scroll down and tap <Plus className="inline h-4 w-4 mx-1" /> <strong>"Add to Home Screen"</strong>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                3
              </div>
              <div className="flex-1">
                <p>
                  Tap <strong>"Add"</strong> to confirm
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-3 space-y-1">
            <p className="text-sm font-medium">Benefits:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Clock in/out even without internet</li>
              <li>• Faster access from home screen</li>
              <li>• Full-screen experience</li>
            </ul>
          </div>
          <Button variant="outline" onClick={handleDismiss} className="w-full bg-transparent">
            Maybe Later
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
