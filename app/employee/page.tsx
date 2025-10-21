"use client"

import { useState, useEffect } from "react"
import { TimeClock } from "@/components/employee/time-clock"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock employee data - in production this would come from auth/database
const EMPLOYEES = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Maria Garcia" },
  { id: "4", name: "David Johnson" },
  { id: "5", name: "Sarah Williams" },
]

export default function EmployeePage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    if (selectedEmployeeId) {
      const employee = EMPLOYEES.find((e) => e.id === selectedEmployeeId)
      setSelectedEmployee(employee || null)
    }
  }, [selectedEmployeeId])

  return (
    <div className="min-h-screen bg-background">
      {!selectedEmployee ? (
        <div className="container max-w-md mx-auto pt-20">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">S&G Construction</CardTitle>
              <p className="text-center text-muted-foreground">Select your name to clock in/out</p>
            </CardHeader>
            <CardContent>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger className="w-full h-12 text-lg">
                  <SelectValue placeholder="Choose your name..." />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEES.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id} className="text-lg">
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      ) : (
        <TimeClock employeeId={selectedEmployee.id} employeeName={selectedEmployee.name} />
      )}
    </div>
  )
}
