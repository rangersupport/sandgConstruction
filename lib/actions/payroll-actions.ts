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

export async function calculateWeeklyPayroll(weekStart: Date): Promise<PayrollCalculation[]> {
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
    console.error("Error fetching employees:", empError)
    return []
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
}

export async function savePayrollRecords(
  payrollData: PayrollCalculation[],
): Promise<{ success: boolean; error?: string }> {
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
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}
