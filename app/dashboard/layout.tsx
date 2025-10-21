import type React from "react"
import { RequireAdmin } from "@/components/auth/require-admin"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RequireAdmin>{children}</RequireAdmin>
}
