"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TimeClock } from "@/components/employee/time-clock"
import { TasksClient } from "@/components/tasks/tasks-client"
import { Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Employee {
  id: string
  name: string
}

export default function EmployeePage() {
  const [employeeId, setEmployeeId] = useState<string | null>(null)
  const [employeeName, setEmployeeName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedEmployeeId = sessionStorage.getItem("employee_id")
    const storedEmployeeName = sessionStorage.getItem("employee_name")

    if (!storedEmployeeId || !storedEmployeeName) {
      router.push("/employee/login")
      return
    }

    setEmployeeId(storedEmployeeId)
    setEmployeeName(storedEmployeeName)
    setLoading(false)
  }, [router])

  if (loading || !employeeId || !employeeName) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="clock" className="w-full">
        <div className="border-b bg-background sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4">
            <TabsList className="w-full grid grid-cols-2 h-14">
              <TabsTrigger value="clock" className="text-base">
                Time Clock
              </TabsTrigger>
              <TabsTrigger value="tasks" className="text-base">
                My Tasks
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="clock" className="mt-0">
          <TimeClock employeeId={employeeId} employeeName={employeeName} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-0">
          <div className="w-full max-w-2xl mx-auto p-4">
            <TasksClient employeeId={employeeId} employeeName={employeeName} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
