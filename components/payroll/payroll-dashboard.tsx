"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Calendar, CheckCircle2, Clock, Download } from "lucide-react"
import { calculateWeeklyPayroll, savePayrollRecords, getWeekStart } from "@/lib/actions/payroll-actions"

interface PayrollData {
  employee_name: string
  regular_hours: number
  overtime_hours: number
  total_hours: number
  hourly_rate: number
  regular_pay: number
  overtime_pay: number
  total_pay: number
}

export function PayrollDashboard() {
  const [payrollData, setPayrollData] = useState<PayrollData[]>([])
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart())
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    loadPayroll()
  }, [weekStart])

  async function loadPayroll() {
    setLoading(true)
    setMessage(null)
    try {
      const data = await calculateWeeklyPayroll(weekStart)
      setPayrollData(data)
    } catch (error) {
      console.error("Error loading payroll:", error)
      setMessage({ type: "error", text: "Failed to load payroll data" })
    } finally {
      setLoading(false)
    }
  }

  async function handleSavePayroll() {
    setLoading(true)
    setMessage(null)
    try {
      const result = await savePayrollRecords(payrollData)
      if (result.success) {
        setMessage({ type: "success", text: "Payroll records saved successfully!" })
      } else {
        setMessage({ type: "error", text: result.error || "Failed to save payroll" })
      }
    } catch (error) {
      console.error("Error saving payroll:", error)
      setMessage({ type: "error", text: "Failed to save payroll records" })
    } finally {
      setLoading(false)
    }
  }

  function handlePreviousWeek() {
    const newDate = new Date(weekStart)
    newDate.setDate(newDate.getDate() - 7)
    setWeekStart(newDate)
  }

  function handleNextWeek() {
    const newDate = new Date(weekStart)
    newDate.setDate(newDate.getDate() + 7)
    setWeekStart(newDate)
  }

  function handleCurrentWeek() {
    setWeekStart(getWeekStart())
  }

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const totalRegularHours = payrollData.reduce((sum, emp) => sum + emp.regular_hours, 0)
  const totalOvertimeHours = payrollData.reduce((sum, emp) => sum + emp.overtime_hours, 0)
  const totalPay = payrollData.reduce((sum, emp) => sum + emp.total_pay, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Weekly Payroll</h1>
          <p className="text-muted-foreground">Calculate and manage employee payments</p>
        </div>
      </div>

      {/* Week Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Select Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handlePreviousWeek}>
              Previous Week
            </Button>
            <div className="flex-1 text-center">
              <div className="text-lg font-semibold">
                {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
              </div>
            </div>
            <Button variant="outline" onClick={handleNextWeek}>
              Next Week
            </Button>
            <Button onClick={handleCurrentWeek}>Current Week</Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollData.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalRegularHours.toFixed(1)}h regular + {totalOvertimeHours.toFixed(1)}h OT
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalRegularHours + totalOvertimeHours).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Combined work hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPay.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Weekly payment total</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Payroll Details</CardTitle>
          <CardDescription>Breakdown of hours and payments for each employee</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading payroll data...</div>
          ) : payrollData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No payroll data for this week</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Regular Hours</TableHead>
                    <TableHead className="text-right">OT Hours</TableHead>
                    <TableHead className="text-right">Total Hours</TableHead>
                    <TableHead className="text-right">Hourly Rate</TableHead>
                    <TableHead className="text-right">Regular Pay</TableHead>
                    <TableHead className="text-right">OT Pay</TableHead>
                    <TableHead className="text-right">Total Pay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollData.map((employee, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{employee.employee_name}</TableCell>
                      <TableCell className="text-right">{employee.regular_hours.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        {employee.overtime_hours > 0 ? (
                          <Badge variant="secondary">{employee.overtime_hours.toFixed(2)}</Badge>
                        ) : (
                          "0.00"
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">{employee.total_hours.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${employee.hourly_rate.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${employee.regular_pay.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${employee.overtime_pay.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-bold">${employee.total_pay.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold">TOTAL</TableCell>
                    <TableCell className="text-right font-bold">{totalRegularHours.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold">{totalOvertimeHours.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold">
                      {(totalRegularHours + totalOvertimeHours).toFixed(2)}
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right font-bold text-lg">${totalPay.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {payrollData.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Button onClick={handleSavePayroll} disabled={loading} className="flex-1" size="lg">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Save & Approve Payroll
              </Button>
              <Button variant="outline" size="lg">
                <Download className="mr-2 h-5 w-5" />
                Export to CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
