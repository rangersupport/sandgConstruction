import type React from "react"
import "./globals.css"
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register"
import { BackgroundSyncListener } from "@/components/pwa/background-sync-listener"
import { OfflineIndicator } from "@/components/pwa/offline-indicator"
import { InstallPrompt } from "@/components/pwa/install-prompt"

export const metadata = {
  title: "S&G Construction - Time Clock",
  description: "Employee time tracking system for S&G Construction",
  manifest: "/manifest.json",
  themeColor: "#0ea5e9",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "S&G Clock",
  },
    generator: 'v0.app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="S&G Clock" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-background text-foreground min-h-screen">
        <ServiceWorkerRegister />
        <BackgroundSyncListener />
        <OfflineIndicator />
        <InstallPrompt />
        <main>{children}</main>
      </body>
    </html>
  )
}
