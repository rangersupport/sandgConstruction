"use client"

import { useState, useEffect } from "react"
import { TimeClock } from "@/components/employee/time-clock"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getEmployees } from "@/lib/actions/employee-actions"
import { Loader2 } from "lucide-react"

interface Employee {
  id: string
  name: string
}

export default function EmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    loadEmployees()
  }, [])

  async function loadEmployees() {
    try {
      const data = await getEmployees()
      setEmployees(data)
    } catch (error) {
      console.error("Error loading employees:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedEmployeeId) {
      const employee = employees.find((e) => e.id === selectedEmployeeId)
      setSelectedEmployee(employee || null)
    }
  }, [selectedEmployeeId, employees])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

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
                  {employees.map((employee) => (
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
