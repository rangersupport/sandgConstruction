import type { ReactNode } from "react"
import { Navigation } from "@/components/navigation"

export default function OpsLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
      <Navigation />
      {children}
    </>
  )
}
