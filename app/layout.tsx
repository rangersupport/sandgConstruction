import type React from "react"
import "./globals.css"

export const metadata = {
  title: "S&G Construction - Time Clock",
  description: "Employee time tracking system for S&G Construction",
    generator: 'v0.app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-screen">
        <main>{children}</main>
      </body>
    </html>
  )
}
