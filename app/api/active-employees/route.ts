import { NextResponse } from "next/server"

export async function GET() {
  try {
    const mockActiveEmployees = [
      {
        id: "1",
        name: "John Doe",
        project_name: "Residential Construction - Palm Beach",
        latitude: 26.7153,
        longitude: -80.0534,
        clock_in: new Date(Date.now() - 2.5 * 3600000).toISOString(),
        hours_elapsed: 2.5,
      },
      {
        id: "2",
        name: "Jane Smith",
        project_name: "Commercial Renovation - Miami",
        latitude: 25.7617,
        longitude: -80.1918,
        clock_in: new Date(Date.now() - 4.2 * 3600000).toISOString(),
        hours_elapsed: 4.2,
      },
      {
        id: "3",
        name: "Maria Garcia",
        project_name: "Office Building - Fort Lauderdale",
        latitude: 26.1224,
        longitude: -80.1373,
        clock_in: new Date(Date.now() - 1.8 * 3600000).toISOString(),
        hours_elapsed: 1.8,
      },
    ]

    return NextResponse.json(mockActiveEmployees)

    /* Production code - uncomment when deploying:
    const supabase = await createClient()

    const { data: timeEntries, error } = await supabase
      .from("time_entries")
      .select("id, employee_id, project_id, clock_in, clock_in_lat, clock_in_lng")
      .is("clock_out", null)
      .not("clock_in_lat", "is", null)
      .not("clock_in_lng", "is", null)

    if (error) {
      console.error("Error fetching active employees:", error)
      return NextResponse.json([])
    }

    if (!timeEntries || timeEntries.length === 0) {
      return NextResponse.json([])
    }

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

    return NextResponse.json(activeEmployees)
    */
  } catch (error) {
    console.error("Error in active-employees API:", error)
    return NextResponse.json([])
  }
}
