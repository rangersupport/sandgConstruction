import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all active time entries with location data
    const { data: timeEntries, error: entriesError } = await supabase
      .from("time_entries")
      .select("id, employee_id, project_id, clock_in, clock_in_lat, clock_in_lng")
      .eq("status", "clocked_in")
      .is("clock_out", null)

    if (entriesError) {
      console.error("[v0] Error fetching time entries:", entriesError)
      return NextResponse.json([])
    }

    if (!timeEntries || timeEntries.length === 0) {
      return NextResponse.json([])
    }

    // Get unique project IDs
    const projectIds = [...new Set(timeEntries.map((e) => e.project_id))]

    // Get project details with GPS coordinates
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id, name, location, latitude, longitude")
      .in("id", projectIds)

    if (projectsError) {
      console.error("[v0] Error fetching projects:", projectsError)
      return NextResponse.json([])
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json([])
    }

    // Get employee details
    const employeeIds = [...new Set(timeEntries.map((e) => e.employee_id))]
    const { data: employees, error: employeesError } = await supabase
      .from("employees")
      .select("id, name")
      .in("id", employeeIds)

    if (employeesError) {
      console.error("[v0] Error fetching employees:", employeesError)
    }

    const employeeMap = new Map(employees?.map((e) => [e.id, e.name]) || [])

    // Group employees by project
    const projectLocations = projects
      .map((project) => {
        const projectEntries = timeEntries.filter((e) => e.project_id === project.id)

        const workers = projectEntries.map((entry) => {
          const hoursElapsed = (Date.now() - new Date(entry.clock_in).getTime()) / 3600000
          return {
            id: entry.employee_id,
            name: employeeMap.get(entry.employee_id) || "Unknown",
            hours: hoursElapsed,
          }
        })

        return {
          project_id: project.id,
          project_name: project.name,
          latitude: project.latitude,
          longitude: project.longitude,
          address: project.location,
          active_workers: workers.length,
          workers,
        }
      })
      .filter((p) => p.active_workers > 0)

    return NextResponse.json(projectLocations)
  } catch (error) {
    console.error("[v0] Error in project-locations API:", error)
    return NextResponse.json([])
  }
}
