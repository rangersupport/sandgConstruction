import { NextResponse } from "next/server"

export async function GET() {
  try {
    const mockProjectLocations = [
      {
        project_id: "1",
        project_name: "Residential Construction - Palm Beach",
        latitude: 26.7153,
        longitude: -80.0534,
        address: "123 Ocean Blvd, Palm Beach, FL",
        active_workers: 3,
        workers: [
          { id: "1", name: "John Doe", hours: 2.5 },
          { id: "4", name: "David Johnson", hours: 3.1 },
          { id: "5", name: "Sarah Williams", hours: 1.2 },
        ],
      },
      {
        project_id: "2",
        project_name: "Commercial Renovation - Miami",
        latitude: 25.7617,
        longitude: -80.1918,
        address: "456 Biscayne Blvd, Miami, FL",
        active_workers: 2,
        workers: [
          { id: "2", name: "Jane Smith", hours: 4.2 },
          { id: "6", name: "Mike Brown", hours: 2.8 },
        ],
      },
      {
        project_id: "3",
        project_name: "Office Building - Fort Lauderdale",
        latitude: 26.1224,
        longitude: -80.1373,
        address: "789 Las Olas Blvd, Fort Lauderdale, FL",
        active_workers: 1,
        workers: [{ id: "3", name: "Maria Garcia", hours: 1.8 }],
      },
    ]

    return NextResponse.json(mockProjectLocations)

    /* Production code - uncomment when deploying:
    const supabase = await createClient()

    // Get all active time entries with location data
    const { data: timeEntries, error: entriesError } = await supabase
      .from("time_entries")
      .select("id, employee_id, project_id, clock_in, clock_in_lat, clock_in_lng")
      .is("clock_out", null)

    if (entriesError || !timeEntries) {
      return NextResponse.json([])
    }

    // Get unique project IDs
    const projectIds = [...new Set(timeEntries.map((e) => e.project_id))]
    
    // Get project details with GPS coordinates
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id, name, address, latitude, longitude")
      .in("id", projectIds)

    if (projectsError || !projects) {
      return NextResponse.json([])
    }

    // Get employee details
    const employeeIds = [...new Set(timeEntries.map((e) => e.employee_id))]
    const { data: employees, error: employeesError } = await supabase
      .from("employees")
      .select("id, name")
      .in("id", employeeIds)

    if (employeesError || !employees) {
      return NextResponse.json([])
    }

    const employeeMap = new Map(employees.map((e) => [e.id, e.name]))

    // Group employees by project
    const projectLocations = projects.map((project) => {
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
        address: project.address,
        active_workers: workers.length,
        workers,
      }
    }).filter((p) => p.active_workers > 0)

    return NextResponse.json(projectLocations)
    */
  } catch (error) {
    console.error("Error in project-locations API:", error)
    return NextResponse.json([])
  }
}
