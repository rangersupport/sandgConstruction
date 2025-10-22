"use server"

import { createClient } from "@/lib/supabase/server"
import { fileMaker } from "@/lib/filemaker/client"
import { revalidatePath } from "next/cache"
import type { TimeEntry, EmployeeStatus } from "@/lib/types/database"

interface ClockInData {
  employeeId: string
  projectId: string
  latitude: number
  longitude: number
  accuracy: number
}

interface ClockOutData {
  timeEntryId: string
  latitude: number
  longitude: number
  accuracy: number
}

async function verifyLocationAtProject(
  latitude: number,
  longitude: number,
  projectId: string,
): Promise<{ verified: boolean; distance?: number; message?: string }> {
  const supabase = await createClient()

  // Get project location
  const { data: project, error } = await supabase
    .from("projects")
    .select("latitude, longitude, geofence_radius")
    .eq("id", projectId)
    .single()

  if (error || !project) {
    return {
      verified: false,
      message: "Could not verify project location",
    }
  }

  if (!project.latitude || !project.longitude) {
    // If project doesn't have GPS coordinates, allow clock-in
    return {
      verified: true,
      message: "Project location not configured",
    }
  }

  // Calculate distance using Haversine formula
  const R = 6371000 // Earth's radius in meters
  const lat1 = (latitude * Math.PI) / 180
  const lat2 = (project.latitude * Math.PI) / 180
  const deltaLat = ((project.latitude - latitude) * Math.PI) / 180
  const deltaLng = ((project.longitude - longitude) * Math.PI) / 180

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  const geofenceRadius = project.geofence_radius || 100

  if (distance <= geofenceRadius) {
    return {
      verified: true,
      distance: Math.round(distance),
      message: `Location verified (${Math.round(distance)}m from site)`,
    }
  } else {
    return {
      verified: false,
      distance: Math.round(distance),
      message: `You are ${Math.round(distance)}m from the project site. Please move closer (within ${geofenceRadius}m).`,
    }
  }
}

export async function getEmployeeStatus(employeeId: string): Promise<EmployeeStatus | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("time_entries")
    .select("id, project_id, clock_in")
    .eq("employee_id", employeeId)
    .eq("status", "clocked_in")
    .is("clock_out", null)
    .order("clock_in", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("Error fetching employee status:", error)
    return null
  }

  if (!data) {
    return {
      is_clocked_in: false,
      time_entry_id: null,
      project_id: null,
      project_name: null,
      clock_in: null,
      hours_elapsed: null,
    }
  }

  const { data: project } = await supabase.from("projects").select("name").eq("id", data.project_id).single()

  const hoursElapsed = (Date.now() - new Date(data.clock_in).getTime()) / 3600000

  return {
    is_clocked_in: true,
    time_entry_id: data.id,
    project_id: data.project_id,
    project_name: project?.name || "Unknown Project",
    clock_in: data.clock_in,
    hours_elapsed: hoursElapsed,
  }
}

export async function clockIn(data: ClockInData): Promise<{ success: boolean; error?: string; timeEntry?: TimeEntry }> {
  const supabase = await createClient()

  const status = await getEmployeeStatus(data.employeeId)
  if (status?.is_clocked_in) {
    const clockInTime = new Date(status.clock_in!).toLocaleString()
    return {
      success: false,
      error: `You are already clocked in at ${status.project_name} since ${clockInTime}. Please clock out before clocking in again.`,
    }
  }

  const verification = await verifyLocationAtProject(data.latitude, data.longitude, data.projectId)

  if (!verification.verified) {
    return {
      success: false,
      error: verification.message || "Location verification failed",
    }
  }

  const clockInTime = new Date().toISOString()

  try {
    // Write to FileMaker first (master data source)
    const fileMakerResult = await fileMaker.createRecord("TimeEntries", {
      employee_id: data.employeeId,
      project_id: data.projectId,
      clock_in: clockInTime,
      clock_in_lat: data.latitude,
      clock_in_lng: data.longitude,
      location_verified: verification.verified,
      distance_from_project: verification.distance || 0,
      status: "clocked_in",
    })

    console.log("[v0] FileMaker clock in successful:", fileMakerResult)
  } catch (error) {
    console.error("[v0] FileMaker clock in failed:", error)
    // Continue to Supabase even if FileMaker fails (for demo purposes)
  }

  // Write to Supabase (for mapping and real-time updates)
  const { data: timeEntry, error } = await supabase
    .from("time_entries")
    .insert({
      employee_id: data.employeeId,
      project_id: data.projectId,
      clock_in: clockInTime,
      clock_in_lat: data.latitude,
      clock_in_lng: data.longitude,
      location_verified: verification.verified,
      distance_from_project: verification.distance || 0,
      status: "clocked_in",
    })
    .select()
    .single()

  if (error) {
    console.error("Error clocking in to Supabase:", error)
    return {
      success: false,
      error: error.message,
    }
  }

  revalidatePath("/employee")
  revalidatePath("/dashboard")

  return {
    success: true,
    timeEntry,
  }
}

export async function clockOut(
  data: ClockOutData,
): Promise<{ success: boolean; error?: string; timeEntry?: TimeEntry }> {
  const supabase = await createClient()

  const clockOutTime = new Date().toISOString()

  try {
    // Get the time entry from Supabase to find employee_id
    const { data: existingEntry } = await supabase
      .from("time_entries")
      .select("employee_id")
      .eq("id", data.timeEntryId)
      .single()

    if (existingEntry) {
      // Find and update in FileMaker
      const fileMakerRecords = await fileMaker.findRecords("TimeEntries", [
        { employee_id: existingEntry.employee_id, status: "clocked_in" },
      ])

      if (fileMakerRecords.response.data && fileMakerRecords.response.data.length > 0) {
        const recordId = fileMakerRecords.response.data[0].recordId

        await fileMaker.updateRecord("TimeEntries", recordId, {
          clock_out: clockOutTime,
          clock_out_lat: data.latitude,
          clock_out_lng: data.longitude,
          status: "clocked_out",
        })

        console.log("[v0] FileMaker clock out successful")
      }
    }
  } catch (error) {
    console.error("[v0] FileMaker clock out failed:", error)
    // Continue to Supabase even if FileMaker fails
  }

  // Update Supabase (for mapping)
  const { data: timeEntry, error } = await supabase
    .from("time_entries")
    .update({
      clock_out: clockOutTime,
      clock_out_lat: data.latitude,
      clock_out_lng: data.longitude,
      status: "clocked_out",
    })
    .eq("id", data.timeEntryId)
    .select()
    .single()

  if (error) {
    console.error("Error clocking out in Supabase:", error)
    return {
      success: false,
      error: error.message,
    }
  }

  revalidatePath("/employee")
  revalidatePath("/dashboard")

  return {
    success: true,
    timeEntry,
  }
}

export async function getActiveProjects() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("projects").select("*").eq("status", "active").order("name")

  if (error) {
    console.error("Error fetching projects:", error)
    return []
  }

  return data
}

export async function getTodayHours(employeeId: string): Promise<number> {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from("time_entries")
    .select("hours_worked")
    .eq("employee_id", employeeId)
    .gte("clock_in", today.toISOString())
    .not("hours_worked", "is", null)

  if (error) {
    console.error("Error fetching today hours:", error)
    return 0
  }

  return data.reduce((sum, entry) => sum + (entry.hours_worked || 0), 0)
}
