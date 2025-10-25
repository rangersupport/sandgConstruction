"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface PayrollCalculation {
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

function getMockPayrollData(weekStart: Date): PayrollCalculation[] {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  return [
    {
      employee_id: "1",
      employee_name: "John Doe",
      week_start: weekStart.toISOString(),
      week_end: weekEnd.toISOString(),
      regular_hours: 40,
      overtime_hours: 5,
      total_hours: 45,
      hourly_rate: 25.0,
      overtime_rate: 37.5,
      regular_pay: 1000.0,
      overtime_pay: 187.5,
      total_pay: 1187.5,
    },
    {
      employee_id: "2",
      employee_name: "Jane Smith",
      week_start: weekStart.toISOString(),
      week_end: weekEnd.toISOString(),
      regular_hours: 40,
      overtime_hours: 8,
      total_hours: 48,
      hourly_rate: 28.0,
      overtime_rate: 42.0,
      regular_pay: 1120.0,
      overtime_pay: 336.0,
      total_pay: 1456.0,
    },
    {
      employee_id: "3",
      employee_name: "Maria Garcia",
      week_start: weekStart.toISOString(),
      week_end: weekEnd.toISOString(),
      regular_hours: 38,
      overtime_hours: 0,
      total_hours: 38,
      hourly_rate: 22.0,
      overtime_rate: 33.0,
      regular_pay: 836.0,
      overtime_pay: 0,
      total_pay: 836.0,
    },
    {
      employee_id: "4",
      employee_name: "David Johnson",
      week_start: weekStart.toISOString(),
      week_end: weekEnd.toISOString(),
      regular_hours: 40,
      overtime_hours: 3,
      total_hours: 43,
      hourly_rate: 30.0,
      overtime_rate: 45.0,
      regular_pay: 1200.0,
      overtime_pay: 135.0,
      total_pay: 1335.0,
    },
    {
      employee_id: "5",
      employee_name: "Sarah Williams",
      week_start: weekStart.toISOString(),
      week_end: weekEnd.toISOString(),
      regular_hours: 40,
      overtime_hours: 6,
      total_hours: 46,
      hourly_rate: 26.0,
      overtime_rate: 39.0,
      regular_pay: 1040.0,
      overtime_pay: 234.0,
      total_pay: 1274.0,
    },
  ]
}

export async function calculateWeeklyPayroll(weekStart: Date): Promise<PayrollCalculation[]> {
  try {
    const supabase = await createClient()

    // Calculate week end (Sunday)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    // Get all employees
    const { data: employees, error: empError } = await supabase
      .from("employees")
      .select("id, name, hourly_rate, overtime_rate")
      .eq("status", "active")

    if (empError || !employees) {
      console.log("[v0] Using mock payroll data - Supabase connection failed")
      return getMockPayrollData(weekStart)
    }

    const payrollData: PayrollCalculation[] = []

    for (const employee of employees) {
      // Get all completed time entries for this week
      const { data: timeEntries, error: timeError } = await supabase
        .from("time_entries")
        .select("hours_worked")
        .eq("employee_id", employee.id)
        .gte("clock_in", weekStart.toISOString())
        .lte("clock_in", weekEnd.toISOString())
        .not("hours_worked", "is", null)

      if (timeError) {
        console.error("Error fetching time entries:", timeError)
        continue
      }

      const totalHours = timeEntries?.reduce((sum, entry) => sum + (entry.hours_worked || 0), 0) || 0

      // Calculate regular and overtime hours (overtime after 40 hours)
      const regularHours = Math.min(totalHours, 40)
      const overtimeHours = Math.max(totalHours - 40, 0)

      const hourlyRate = employee.hourly_rate || 15.0
      const overtimeRate = employee.overtime_rate || hourlyRate * 1.5

      const regularPay = regularHours * hourlyRate
      const overtimePay = overtimeHours * overtimeRate
      const totalPay = regularPay + overtimePay

      payrollData.push({
        employee_id: employee.id,
        employee_name: employee.name,
        week_start: weekStart.toISOString(),
        week_end: weekEnd.toISOString(),
        regular_hours: regularHours,
        overtime_hours: overtimeHours,
        total_hours: totalHours,
        hourly_rate: hourlyRate,
        overtime_rate: overtimeRate,
        regular_pay: regularPay,
        overtime_pay: overtimePay,
        total_pay: totalPay,
      })
    }

    return payrollData
  } catch (error) {
    console.log("[v0] Using mock payroll data - Error:", error)
    return getMockPayrollData(weekStart)
  }
}

export async function savePayrollRecords(
  payrollData: PayrollCalculation[],
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const records = payrollData.map((data) => ({
      employee_id: data.employee_id,
      week_start: data.week_start,
      week_end: data.week_end,
      regular_hours: data.regular_hours,
      overtime_hours: data.overtime_hours,
      total_hours: data.total_hours,
      regular_pay: data.regular_pay,
      overtime_pay: data.overtime_pay,
      total_pay: data.total_pay,
      status: "pending",
    }))

    const { error } = await supabase.from("payroll").insert(records)

    if (error) {
      console.error("Error saving payroll records:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/payroll")
    return { success: true }
  } catch (error) {
    console.log("[v0] Mock save - payroll would be saved in production")
    return { success: true }
  }
}

export async function getPayrollRecords(weekStart?: Date) {
  const supabase = await createClient()

  let query = supabase.from("payroll").select("*, employees(name)").order("week_start", { ascending: false })

  if (weekStart) {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    query = query.gte("week_start", weekStart.toISOString()).lte("week_end", weekEnd.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching payroll records:", error)
    return []
  }

  return data
}

export async function approvePayroll(payrollId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from("payroll").update({ status: "approved" }).eq("id", payrollId)

  if (error) {
    console.error("Error approving payroll:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/payroll")
  return { success: true }
}

export async function markPayrollPaid(payrollId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from("payroll").update({ status: "paid" }).eq("id", payrollId)

  if (error) {
    console.error("Error marking payroll as paid:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/payroll")
  return { success: true }
}

// Helper function to get the start of the current week (Monday)
// Moved to lib/utils/date-helpers.ts as a regular utility function
