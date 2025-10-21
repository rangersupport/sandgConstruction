"use server"

import { createClient } from "@/lib/supabase/server"
import { sendNotification, formatReminderMessage } from "@/lib/services/notification-service"
import type { EmployeeNeedingReminder } from "@/lib/types/database"

export async function getEmployeesNeedingReminders(): Promise<EmployeeNeedingReminder[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("get_employees_needing_reminders")

  if (error) {
    console.error("[v0] Error fetching employees needing reminders:", error)
    return []
  }

  return data || []
}

export async function sendClockOutReminder(
  employee: EmployeeNeedingReminder,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Format the reminder message
  const message = formatReminderMessage(employee.employee_name, employee.project_name, employee.hours_elapsed)

  // Determine contact method
  const contactInfo = employee.notification_method === "email" ? employee.employee_email : employee.employee_phone

  if (!contactInfo) {
    console.error("[v0] No contact info for employee:", employee.employee_name)
    return {
      success: false,
      error: "No contact information available",
    }
  }

  // Send notification
  const result = await sendNotification({
    to: contactInfo,
    message,
    method: employee.notification_method as "sms" | "whatsapp" | "email",
  })

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    }
  }

  // Update time_entries to mark reminder as sent
  const { error: updateError } = await supabase
    .from("time_entries")
    .update({
      reminder_sent_at: new Date().toISOString(),
    })
    .eq("id", employee.time_entry_id)

  if (updateError) {
    console.error("[v0] Error updating reminder status:", updateError)
    return {
      success: false,
      error: "Failed to update reminder status",
    }
  }

  // Create clock_reminders record
  const { error: reminderError } = await supabase.from("clock_reminders").insert({
    time_entry_id: employee.time_entry_id,
    reminder_sent_at: new Date().toISOString(),
    reminder_acknowledged: false,
    auto_clockout_triggered: false,
  })

  if (reminderError) {
    console.error("[v0] Error creating reminder record:", reminderError)
  }

  console.log(`[v0] Reminder sent to ${employee.employee_name} for ${employee.project_name}`)

  return {
    success: true,
  }
}

export async function processAllReminders(): Promise<{ sent: number; failed: number }> {
  const employees = await getEmployeesNeedingReminders()

  let sent = 0
  let failed = 0

  for (const employee of employees) {
    const result = await sendClockOutReminder(employee)
    if (result.success) {
      sent++
    } else {
      failed++
    }
  }

  console.log(`[v0] Processed reminders: ${sent} sent, ${failed} failed`)

  return { sent, failed }
}
