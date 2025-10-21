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
