import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Sparkline from "./Sparkline"
import { Badge } from "@/components/ui/badge"

type ActiveWorkerRow = {
  id: string
  clock_in: string
  employee_id: string
  project_id: string
}

type EmployeeRow = {
  id: string
  first_name: string
  last_name: string
}

type ProjectRow = {
  id: string
  name: string
}

type RecentEntryRow = {
  id: string
  clock_in: string
  clock_out: string | null
  hours_worked: number | null
  updated_at: string
  employee_id: string
  project_id: string
}

function formatDuration(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: activeWorkersData } = await supabase
    .from("time_entries")
    .select("id, clock_in, employee_id, project_id")
    .eq("status", "clocked_in")
    .is("clock_out", null)
    .order("clock_in", { ascending: false })

  const activeWorkers = (activeWorkersData || []) as ActiveWorkerRow[]

  // Fetch all employees and projects for lookups
  const { data: employeesData } = await supabase.from("employees").select("id, first_name, last_name")

  const { data: projectsData } = await supabase.from("projects").select("id, name")

  const employeesMap = new Map((employeesData || []).map((e: EmployeeRow) => [e.id, e]))
  const projectsMap = new Map((projectsData || []).map((p: ProjectRow) => [p.id, p]))

  // Counts
  const [employeesCountRes, projectsCountRes] = await Promise.all([
    supabase.from("employees").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "active"),
  ])
  const totalEmployees = employeesCountRes.count || 0
  const activeProjects = projectsCountRes.count || 0

  // This week hours
  const startOfWeek = new Date()
  const day = startOfWeek.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  startOfWeek.setDate(startOfWeek.getDate() + diff)
  startOfWeek.setHours(0, 0, 0, 0)
  const { data: weekEntries } = await supabase
    .from("time_entries")
    .select("hours_worked")
    .gte("clock_in", startOfWeek.toISOString())
    .not("hours_worked", "is", null)
  const thisWeekHours = (weekEntries || []).reduce((sum, e) => sum + (e.hours_worked || 0), 0)

  const { data: recentData } = await supabase
    .from("time_entries")
    .select("id, clock_in, clock_out, hours_worked, updated_at, employee_id, project_id")
    .order("updated_at", { ascending: false })
    .limit(5)
  const recentEntries = (recentData || []) as RecentEntryRow[]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Overview of your construction operations</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeWorkers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently clocked in</p>
            <Sparkline
              data={Array.from({ length: 14 }, (_, i) => ({
                x: i,
                y: Math.max(1, activeWorkers.length + Math.random() * 2 - 1),
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatDuration(thisWeekHours)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total hours worked</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Active Workers</CardTitle>
          </CardHeader>
          <CardContent>
            {activeWorkers.length === 0 ? (
              <div className="text-sm text-muted-foreground">No workers currently clocked in</div>
            ) : (
              <ul className="space-y-3">
                {activeWorkers.map((row) => {
                  const employee = employeesMap.get(row.employee_id)
                  const project = projectsMap.get(row.project_id)
                  const employeeName = employee ? `${employee.first_name} ${employee.last_name}` : "Unknown Employee"
                  const projectName = project ? project.name : "Unknown Project"
                  const clockIn = new Date(row.clock_in).toLocaleString()
                  return (
                    <li key={row.id} className="flex items-center justify-between border rounded-md p-3">
                      <div>
                        <div className="font-medium">{employeeName}</div>
                        <div className="text-xs text-muted-foreground">Clocked in: {clockIn}</div>
                      </div>
                      <Badge variant="secondary">{projectName}</Badge>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEntries.length === 0 ? (
              <div className="text-sm text-muted-foreground">No recent activity</div>
            ) : (
              <ul className="space-y-3">
                {recentEntries.map((row) => {
                  const employee = employeesMap.get(row.employee_id)
                  const project = projectsMap.get(row.project_id)
                  const employeeName = employee ? `${employee.first_name} ${employee.last_name}` : "Unknown Employee"
                  const projectName = project ? project.name : "Unknown Project"
                  const duration =
                    row.hours_worked != null
                      ? formatDuration(row.hours_worked)
                      : formatDuration(Math.max(0, (Date.now() - new Date(row.clock_in).getTime()) / 3600000))
                  return (
                    <li key={row.id} className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{employeeName}</div>
                        <Badge variant="outline">{duration}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{projectName}</div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
