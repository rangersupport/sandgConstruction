"use server"

import { createClient } from "@/lib/supabase/server"

export interface AutoClockoutReport {
  id: string
  employee_name: string
  project_name: string
  clock_in: string
  clock_out: string
  hours_worked: number
  reminder_sent_at: string
  auto_clockout_at: string
  distance_from_project: number
  location_verified: boolean
}

export interface LocationComplianceReport {
  id: string
  employee_name: string
  project_name: string
  clock_in: string
  distance_from_project: number
  location_verified: boolean
  clock_in_lat: number
  clock_in_lng: number
  project_lat: number
  project_lng: number
}

export async function getAutoClockoutReports(startDate?: string, endDate?: string): Promise<AutoClockoutReport[]> {
  const supabase = await createClient()

  let query = supabase
    .from("time_entries")
    .select(
      `
      id,
      clock_in,
      clock_out,
      hours_worked,
      reminder_sent_at,
      distance_from_project,
      location_verified,
      employee:employees(name),
      project:projects(name),
      reminder:clock_reminders(auto_clockout_at)
    `,
    )
    .eq("is_auto_clocked_out", true)
    .order("clock_out", { ascending: false })

  if (startDate) {
    query = query.gte("clock_out", startDate)
  }

  if (endDate) {
    query = query.lte("clock_out", endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching auto clock-out reports:", error)
    return []
  }

  return (
    data?.map((entry: any) => ({
      id: entry.id,
      employee_name: entry.employee?.name || "Unknown",
      project_name: entry.project?.name || "Unknown",
      clock_in: entry.clock_in,
      clock_out: entry.clock_out,
      hours_worked: entry.hours_worked || 0,
      reminder_sent_at: entry.reminder_sent_at,
      auto_clockout_at: entry.reminder?.[0]?.auto_clockout_at || entry.clock_out,
      distance_from_project: entry.distance_from_project || 0,
      location_verified: entry.location_verified || false,
    })) || []
  )
}

export async function getLocationComplianceReports(
  startDate?: string,
  endDate?: string,
): Promise<LocationComplianceReport[]> {
  const supabase = await createClient()

  let query = supabase
    .from("time_entries")
    .select(
      `
      id,
      clock_in,
      distance_from_project,
      location_verified,
      clock_in_lat,
      clock_in_lng,
      employee:employees(name),
      project:projects(name, latitude, longitude)
    `,
    )
    .not("clock_in_lat", "is", null)
    .not("clock_in_lng", "is", null)
    .order("clock_in", { ascending: false })

  if (startDate) {
    query = query.gte("clock_in", startDate)
  }

  if (endDate) {
    query = query.lte("clock_in", endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching location compliance reports:", error)
    return []
  }

  return (
    data?.map((entry: any) => ({
      id: entry.id,
      employee_name: entry.employee?.name || "Unknown",
      project_name: entry.project?.name || "Unknown",
      clock_in: entry.clock_in,
      distance_from_project: entry.distance_from_project || 0,
      location_verified: entry.location_verified || false,
      clock_in_lat: entry.clock_in_lat,
      clock_in_lng: entry.clock_in_lng,
      project_lat: entry.project?.latitude,
      project_lng: entry.project?.longitude,
    })) || []
  )
}

export async function getAutoClockoutStats(startDate?: string, endDate?: string) {
  const reports = await getAutoClockoutReports(startDate, endDate)

  return {
    total: reports.length,
    totalHours: reports.reduce((sum, r) => sum + r.hours_worked, 0),
    averageHours: reports.length > 0 ? reports.reduce((sum, r) => sum + r.hours_worked, 0) / reports.length : 0,
    locationVerified: reports.filter((r) => r.location_verified).length,
    locationUnverified: reports.filter((r) => !r.location_verified).length,
  }
}

export async function getLocationComplianceStats(startDate?: string, endDate?: string) {
  const reports = await getLocationComplianceReports(startDate, endDate)

  return {
    total: reports.length,
    verified: reports.filter((r) => r.location_verified).length,
    unverified: reports.filter((r) => !r.location_verified).length,
    complianceRate: reports.length > 0 ? (reports.filter((r) => r.location_verified).length / reports.length) * 100 : 0,
    averageDistance:
      reports.length > 0 ? reports.reduce((sum, r) => sum + r.distance_from_project, 0) / reports.length : 0,
  }
}

export async function adminClockOut(timeEntryId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const clockOutTime = new Date().toISOString()

  const { data: timeEntry, error } = await supabase
    .from("time_entries")
    .update({
      clock_out: clockOutTime,
      status: "clocked_out",
    })
    .eq("id", timeEntryId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error clocking out employee:", error)
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
  }
}

export async function adminClockIn(
  employeeId: string,
  projectId: string,
  latitude?: number,
  longitude?: number,
  notes?: string,
): Promise<{ success: boolean; error?: string; timeEntryId?: string }> {
  const supabase = await createClient()

  // Check if employee is already clocked in
  const { data: existingEntry } = await supabase
    .from("time_entries")
    .select("id")
    .eq("employee_id", employeeId)
    .eq("status", "clocked_in")
    .single()

  if (existingEntry) {
    return {
      success: false,
      error: "Employee is already clocked in",
    }
  }

  const clockInTime = new Date().toISOString()

  const { data: timeEntry, error } = await supabase
    .from("time_entries")
    .insert({
      employee_id: employeeId,
      project_id: projectId,
      clock_in: clockInTime,
      status: "clocked_in",
      clock_in_lat: latitude,
      clock_in_lng: longitude,
      notes: notes || "Manually clocked in by admin",
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error manually clocking in employee:", error)
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
    timeEntryId: timeEntry.id,
  }
}

export async function getAllEmployeesWithStatus() {
  const supabase = await createClient()

  const { data: employees, error: employeesError } = await supabase
    .from("employees")
    .select("id, name, email, phone, role, status")
    .eq("status", "active")
    .order("name")

  if (employeesError) {
    console.error("[v0] Error fetching employees:", employeesError)
    return []
  }

  // Get current clock-in status for each employee
  const employeesWithStatus = await Promise.all(
    employees.map(async (employee) => {
      const { data: timeEntry } = await supabase
        .from("time_entries")
        .select(
          `
          id,
          clock_in,
          clock_in_lat,
          clock_in_lng,
          project:projects(id, name, address)
        `,
        )
        .eq("employee_id", employee.id)
        .eq("status", "clocked_in")
        .single()

      return {
        ...employee,
        currentTimeEntry: timeEntry || null,
        isClockedIn: !!timeEntry,
      }
    }),
  )

  return employeesWithStatus
}

export async function adminEditTimeEntry(
  timeEntryId: string,
  updates: {
    clock_in?: string
    clock_out?: string
    notes?: string
  },
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from("time_entries").update(updates).eq("id", timeEntryId)

  if (error) {
    console.error("[v0] Error editing time entry:", error)
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
  }
}
