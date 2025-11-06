"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Calendar, CheckCircle2, Clock, Download, Printer } from "lucide-react"
import { calculateWeeklyPayroll, savePayrollToHistory, markTimeEntriesAsPaid } from "@/lib/actions/payroll-actions"
import { getWeekStart } from "@/lib/utils/date-helpers"

interface PayrollData {
  employee_id: string
  employee_name: string
  week_start: string
  week_end: string
  regular_hours: number
  overtime_hours: number
  total_hours: number
  hourly_rate: number
  overtime_rate: number
  regular_pay: number
  overtime_pay: number
  total_pay: number
}

export function PayrollDashboard() {
  const [payrollData, setPayrollData] = useState<PayrollData[]>([])
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart())
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [processing, setProcessing] = useState(false)

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

  async function handleProcessPayroll() {
    if (payrollData.length === 0) {
      setMessage({ type: "error", text: "No payroll data to process" })
      return
    }

    setProcessing(true)
    setMessage(null)

    try {
      const payDate = new Date()
      const historyResult = await savePayrollToHistory(payrollData, payDate)

      if (!historyResult.success) {
        setMessage({ type: "error", text: historyResult.error || "Failed to save payroll history" })
        setProcessing(false)
        return
      }

      // Mark all time entries as paid
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      let allMarked = true
      for (let i = 0; i < payrollData.length; i++) {
        const markResult = await markTimeEntriesAsPaid(
          payrollData[i].employee_id,
          weekStart,
          weekEnd,
          historyResult.payrollHistoryIds![i],
        )

        if (!markResult.success) {
          console.error(`Failed to mark entries for employee ${payrollData[i].employee_id}:`, markResult.error)
          allMarked = false
        }
      }

      if (allMarked) {
        setMessage({ type: "success", text: `Payroll processed successfully! ${payrollData.length} employees paid.` })
        setPayrollData([])
      } else {
        setMessage({
          type: "error",
          text: "Payroll history saved but some time entries failed to update. Please review manually.",
        })
      }
    } catch (error) {
      console.error("Error processing payroll:", error)
      setMessage({ type: "error", text: "Failed to process payroll" })
    } finally {
      setProcessing(false)
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

  function handlePrintChecks() {
    const printWindow = window.open("/admin/payroll/checks/print", "_blank")
    if (printWindow) {
      printWindow.focus()
    }
  }

  const weekStartDate = new Date(weekStart)
  const weekEnd = new Date(weekStartDate)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const totalRegularHours = payrollData.reduce((sum, emp) => sum + emp.regular_hours, 0)
  const totalOvertimeHours = payrollData.reduce((sum, emp) => sum + emp.overtime_hours, 0)
  const totalPay = payrollData.reduce((sum, emp) => sum + emp.total_pay, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Weekly Payroll</h1>
          <p className="text-muted-foreground">Calculate and manage employee payments (Unpaid Hours Only)</p>
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
                {weekStartDate.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
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
            <p className="text-xs text-muted-foreground">Combined unpaid work hours</p>
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
          <CardTitle>Employee Payroll Details (Unpaid Hours)</CardTitle>
          <CardDescription>Only showing unpaid time entries for this week</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading payroll data...</div>
          ) : payrollData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No unpaid hours found for this week</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Regular Hours</TableHead>
                    <TableHead className="text-right">OT Hours</TableHead>
                    <TableHead className="text-right">Total Hours</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
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
                  {payrollData.length > 0 && (
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
                  )}
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
            <div className="flex items-center gap-4 flex-wrap">
              <Button onClick={handlePrintChecks} variant="outline" size="lg">
                <Printer className="mr-2 h-5 w-5" />
                Print Checks
              </Button>
              <Button onClick={handleProcessPayroll} disabled={processing} className="flex-1" size="lg">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                {processing ? "Processing..." : "Mark as Paid & Save"}
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
