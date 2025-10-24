"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TimeClock } from "@/components/employee/time-clock"
import { Loader2 } from "lucide-react"

interface Employee {
  id: string
  name: string
}

export default function EmployeePage() {
  const [mounted, setMounted] = useState(false)
  const [employeeId, setEmployeeId] = useState<string | null>(null)
  const [employeeName, setEmployeeName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)

    const storedEmployeeId = sessionStorage.getItem("employee_id")
    const storedEmployeeName = sessionStorage.getItem("employee_name")

    console.log("[v0] Employee page - stored ID:", storedEmployeeId)
    console.log("[v0] Employee page - stored name:", storedEmployeeName)

    if (!storedEmployeeId || !storedEmployeeName) {
      console.log("[v0] No employee session found, redirecting to login")
      router.push("/employee/login")
      return
    }

    setEmployeeId(storedEmployeeId)
    setEmployeeName(storedEmployeeName)
    setLoading(false)
  }, [router])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!employeeId || !employeeName) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <TimeClock employeeId={employeeId} employeeName={employeeName} />
    </div>
  )
}
