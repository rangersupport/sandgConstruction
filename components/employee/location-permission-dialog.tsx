"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPin, Smartphone } from "lucide-react"

interface LocationPermissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRetry: () => void
}

export function LocationPermissionDialog({ open, onOpenChange, onRetry }: LocationPermissionDialogProps) {
  const isIOS = typeof window !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isSafari = typeof window !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-orange-100 dark:bg-orange-900 p-3">
              <MapPin className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <DialogTitle className="text-center">Location Access Required</DialogTitle>
          <DialogDescription className="text-center">
            This app needs your location to record where you clock in and out.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isIOS || isSafari ? (
            <>
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold">To enable location on iPhone/Safari:</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                      <li>
                        Open your iPhone <strong>Settings</strong> app
                      </li>
                      <li>
                        Scroll down and tap <strong>Safari</strong>
                      </li>
                      <li>
                        Tap <strong>Location</strong>
                      </li>
                      <li>
                        Select <strong>Ask</strong> or <strong>Allow</strong>
                      </li>
                      <li>Return to this page and tap "Try Again"</li>
                    </ol>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                You may need to refresh the page after changing settings
              </p>
            </>
          ) : (
            <>
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold">To enable location:</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                      <li>Click the lock or info icon in your browser's address bar</li>
                      <li>Find "Location" permissions</li>
                      <li>Change it to "Allow"</li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={onRetry} className="w-full">
            Try Again
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
