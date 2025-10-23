import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: timeEntries, error } = await supabase
      .from("time_entries")
      .select("id, employee_id, project_id, clock_in, clock_in_lat, clock_in_lng")
      .eq("status", "clocked_in")
      .is("clock_out", null)
      .not("clock_in_lat", "is", null)
      .not("clock_in_lng", "is", null)

    if (error) {
      console.error("[v0] Error fetching active employees:", error)
      return NextResponse.json([])
    }

    if (!timeEntries || timeEntries.length === 0) {
      console.log("[v0] No active employees found")
      return NextResponse.json([])
    }

    console.log("[v0] Found", timeEntries.length, "active employees")

    const employeeIds = [...new Set(timeEntries.map((e) => e.employee_id))]
    const projectIds = [...new Set(timeEntries.map((e) => e.project_id))]

    const [{ data: employees }, { data: projects }] = await Promise.all([
      supabase.from("employees").select("id, name").in("id", employeeIds),
      supabase.from("projects").select("id, name").in("id", projectIds),
    ])

    const employeeMap = new Map(employees?.map((e) => [e.id, e.name]))
    const projectMap = new Map(projects?.map((p) => [p.id, p.name]))

    const activeEmployees = timeEntries.map((entry) => {
      const hoursElapsed = (Date.now() - new Date(entry.clock_in).getTime()) / 3600000

      return {
        id: entry.id,
        name: employeeMap.get(entry.employee_id) || "Unknown",
        project_name: projectMap.get(entry.project_id) || "Unknown Project",
        latitude: entry.clock_in_lat,
        longitude: entry.clock_in_lng,
        clock_in: entry.clock_in,
        hours_elapsed: hoursElapsed,
      }
    })

    console.log("[v0] Returning", activeEmployees.length, "active employees with locations")
    return NextResponse.json(activeEmployees)
  } catch (error) {
    console.error("[v0] Error in active-employees API:", error)
    return NextResponse.json([])
  }
}
