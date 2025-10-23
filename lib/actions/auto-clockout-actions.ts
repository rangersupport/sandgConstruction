"use server"

import { createClient } from "@/lib/supabase/server"
import { sendNotification, formatAutoClockoutMessage } from "@/lib/services/notification-service"
import type { EmployeeNeedingAutoClockout } from "@/lib/types/database"

export async function getEmployeesNeedingAutoClockout(): Promise<EmployeeNeedingAutoClockout[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("get_employees_needing_auto_clockout")

  if (error) {
    console.error("[v0] Error fetching employees needing auto clock-out:", error)
    return []
  }

  return data || []
}

export async function autoClockOutEmployee(
  employee: EmployeeNeedingAutoClockout,
): Promise<{ success: boolean; error?: string; hoursWorked?: number }> {
  const supabase = await createClient()

  const clockOutTime = new Date().toISOString()

  // Update time_entries to clock out
  const { data: timeEntry, error: clockOutError } = await supabase
    .from("time_entries")
    .update({
      clock_out: clockOutTime,
      is_auto_clocked_out: true,
      status: "clocked_out",
    })
    .eq("id", employee.time_entry_id)
    .select("hours_worked, employee_id, project_id")
    .single()

  if (clockOutError) {
    console.error("[v0] Error auto clocking out:", clockOutError)
    return {
      success: false,
      error: clockOutError.message,
    }
  }

  // Update clock_reminders record
  const { error: reminderError } = await supabase
    .from("clock_reminders")
    .update({
      auto_clockout_triggered: true,
      auto_clockout_at: clockOutTime,
    })
    .eq("time_entry_id", employee.time_entry_id)

  if (reminderError) {
    console.error("[v0] Error updating reminder record:", reminderError)
  }

  // Get employee contact info for notification
  const { data: empData } = await supabase
    .from("employees")
    .select("phone, email")
    .eq("id", timeEntry.employee_id)
    .single()

  const { data: preferences } = await supabase
    .from("employee_preferences")
    .select("notification_method, phone_number, email")
    .eq("employee_id", timeEntry.employee_id)
    .single()

  // Send notification to employee
  const contactInfo =
    preferences?.notification_method === "email"
      ? preferences?.email || empData?.email
      : preferences?.phone_number || empData?.phone

  if (contactInfo) {
    const message = formatAutoClockoutMessage(
      employee.employee_name,
      employee.project_name,
      timeEntry.hours_worked || 0,
    )

    await sendNotification({
      to: contactInfo,
      message,
      method: (preferences?.notification_method as "sms" | "whatsapp" | "email") || "sms",
    })
  }

  console.log(`[v0] Auto clocked out ${employee.employee_name} from ${employee.project_name}`)

  return {
    success: true,
    hoursWorked: timeEntry.hours_worked || 0,
  }
}

export async function processAllAutoClockouts(): Promise<{
  processed: number
  failed: number
  totalHours: number
  employees: string[]
}> {
  const employees = await getEmployeesNeedingAutoClockout()

  let processed = 0
  let failed = 0
  let totalHours = 0
  const employeeNames: string[] = []

  for (const employee of employees) {
    const result = await autoClockOutEmployee(employee)
    if (result.success) {
      processed++
      totalHours += result.hoursWorked || 0
      employeeNames.push(employee.employee_name)
    } else {
      failed++
    }
  }

  console.log(`[v0] Processed auto clock-outs: ${processed} successful, ${failed} failed`)

  return {
    processed,
    failed,
    totalHours,
    employees: employeeNames,
  }
}

export async function sendAdminNotification(autoClockoutSummary: {
  processed: number
  failed: number
  totalHours: number
  employees: string[]
}): Promise<void> {
  if (autoClockoutSummary.processed === 0) {
    return
  }

  const supabase = await createClient()

  // Get admin emails
  const { data: admins } = await supabase
    .from("employees")
    .select("email, name")
    .eq("role", "admin")
    .not("email", "is", null)

  if (!admins || admins.length === 0) {
    console.log("[v0] No admin emails found for notification")
    return
  }

  const message = `Auto Clock-Out Report

${autoClockoutSummary.processed} employee(s) were automatically clocked out:

${autoClockoutSummary.employees.map((name) => `- ${name}`).join("\n")}

Total hours: ${autoClockoutSummary.totalHours.toFixed(2)}
Failed: ${autoClockoutSummary.failed}

Please review these entries in the admin dashboard.

- S&G Construction Time Clock System`

  // Send to all admins
  for (const admin of admins) {
    if (admin.email) {
      await sendNotification({
        to: admin.email,
        message,
        method: "email",
      })
    }
  }

  console.log(`[v0] Admin notifications sent to ${admins.length} admin(s)`)
}
