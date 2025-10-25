import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    if (!supabase) {
      console.warn("[v0] Supabase not configured, returning empty array")
      return NextResponse.json([])
    }

    const { data: timeEntries, error: entriesError } = await supabase
      .from("time_entries")
      .select("id, employee_id, project_id, clock_in, clock_in_lat, clock_in_lng, clock_in_location")
      .eq("status", "clocked_in")
      .is("clock_out", null)
      .not("clock_in_lat", "is", null)
      .not("clock_in_lng", "is", null)

    if (entriesError) {
      console.error("[v0] Error fetching time entries:", entriesError)
      return NextResponse.json([])
    }

    if (!timeEntries || timeEntries.length === 0) {
      return NextResponse.json([])
    }

    const validEntries = timeEntries.filter(
      (e) => e.clock_in_lat !== null && e.clock_in_lng !== null && e.clock_in_lat !== 0 && e.clock_in_lng !== 0,
    )

    if (validEntries.length === 0) {
      return NextResponse.json([])
    }

    // Get unique project IDs
    const projectIds = [...new Set(validEntries.map((e) => e.project_id))]

    // Get project details
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id, name, location")
      .in("id", projectIds)

    if (projectsError) {
      console.error("[v0] Error fetching projects:", projectsError)
      return NextResponse.json([])
    }

    const projectMap = new Map(projects?.map((p) => [p.id, p]) || [])

    // Get employee details
    const employeeIds = [...new Set(validEntries.map((e) => e.employee_id))]
    const { data: employees, error: employeesError } = await supabase
      .from("employees")
      .select("id, name")
      .in("id", employeeIds)

    if (employeesError) {
      console.error("[v0] Error fetching employees:", employeesError)
    }

    const employeeMap = new Map(employees?.map((e) => [e.id, e.name]) || [])

    const projectLocations = validEntries.reduce((acc, entry) => {
      const project = projectMap.get(entry.project_id)
      if (!project) return acc

      // Find existing project location or create new one
      let projectLoc = acc.find((p) => p.project_id === entry.project_id)

      if (!projectLoc) {
        projectLoc = {
          project_id: project.id,
          project_name: project.name,
          latitude: entry.clock_in_lat,
          longitude: entry.clock_in_lng,
          address: entry.clock_in_location || project.location || "Location not available",
          active_workers: 0,
          workers: [],
        }
        acc.push(projectLoc)
      }

      // Add worker to this project
      const hoursElapsed = (Date.now() - new Date(entry.clock_in).getTime()) / 3600000
      projectLoc.workers.push({
        id: entry.employee_id,
        name: employeeMap.get(entry.employee_id) || "Unknown",
        hours: hoursElapsed,
        latitude: entry.clock_in_lat,
        longitude: entry.clock_in_lng,
      })
      projectLoc.active_workers = projectLoc.workers.length

      return acc
    }, [] as any[])

    return NextResponse.json(projectLocations)
  } catch (error) {
    console.error("[v0] Error in project-locations API:", error)
    return NextResponse.json([])
  }
}
