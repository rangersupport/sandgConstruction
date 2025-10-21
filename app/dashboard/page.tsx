import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Sparkline from "./Sparkline"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

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

const mockData = {
  activeWorkers: [
    {
      id: "1",
      name: "John Doe",
      project: "Residential Construction",
      clockIn: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: "2",
      name: "Jane Smith",
      project: "Commercial Renovation",
      clockIn: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
  ],
  totalEmployees: 5,
  activeProjects: 3,
  thisWeekHours: 127.5,
  recentEntries: [
    { id: "1", name: "John Doe", project: "Residential Construction", hours: 8.5, date: "Today" },
    { id: "2", name: "Jane Smith", project: "Commercial Renovation", hours: 7.0, date: "Today" },
    { id: "3", name: "Maria Garcia", project: "Office Building", hours: 8.0, date: "Yesterday" },
    { id: "4", name: "David Johnson", project: "Residential Construction", hours: 9.0, date: "Yesterday" },
    { id: "5", name: "Sarah Williams", project: "Commercial Renovation", hours: 7.5, date: "2 days ago" },
  ],
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user session, redirect to admin login
  if (!user) {
    redirect("/admin/login")
  }

  // Verify user is an admin
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id, email, name")
    .eq("email", user.email)
    .single()

  // If not an admin, redirect to employee page
  if (!adminUser) {
    redirect("/employee")
  }

  // const { data: activeWorkersData } = await supabase
  //   .from("time_entries")
  //   .select("id, clock_in, employee_id, project_id")
  //   .eq("status", "clocked_in")
  //   .is("clock_out", null)
  //   .order("clock_in", { ascending: false })

  // const activeWorkers = (activeWorkersData || []) as ActiveWorkerRow[]

  // // Fetch all employees and projects for lookups
  // const { data: employeesData } = await supabase.from("employees").select("id, first_name, last_name")

  // const { data: projectsData } = await supabase.from("projects").select("id, name")

  // const employeesMap = new Map((employeesData || []).map((e: EmployeeRow) => [e.id, e]))
  // const projectsMap = new Map((projectsData || []).map((p: ProjectRow) => [p.id, p]))

  // // Counts
  // const [employeesCountRes, projectsCountRes] = await Promise.all([
  //   supabase.from("employees").select("*", { count: "exact", head: true }).eq("status", "active"),
  //   supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "active"),
  // ])
  // const totalEmployees = employeesCountRes.count || 0
  // const activeProjects = projectsCountRes.count || 0

  // // This week hours
  // const startOfWeek = new Date()
  // const day = startOfWeek.getDay()
  // const diff = (day === 0 ? -6 : 1) - day
  // startOfWeek.setDate(startOfWeek.getDate() + diff)
  // startOfWeek.setHours(0, 0, 0, 0)
  // const { data: weekEntries } = await supabase
  //   .from("time_entries")
  //   .select("hours_worked")
  //   .gte("clock_in", startOfWeek.toISOString())
  //   .not("hours_worked", "is", null)
  // const thisWeekHours = (weekEntries || []).reduce((sum, e) => sum + (e.hours_worked || 0), 0)

  // const { data: recentData } = await supabase
  //   .from("time_entries")
  //   .select("id, clock_in, clock_out, hours_worked, updated_at, employee_id, project_id")
  //   .order("updated_at", { ascending: false })
  //   .limit(5)
  // const recentEntries = (recentData || []) as RecentEntryRow[]

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
            <div className="text-3xl font-bold">{mockData.activeWorkers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently clocked in</p>
            <Sparkline
              data={Array.from({ length: 14 }, (_, i) => ({
                x: i,
                y: Math.max(1, mockData.activeWorkers.length + Math.random() * 2 - 1),
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockData.totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockData.activeProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatDuration(mockData.thisWeekHours)}</div>
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
            <ul className="space-y-3">
              {mockData.activeWorkers.map((worker) => {
                const clockIn = new Date(worker.clockIn).toLocaleString()
                return (
                  <li key={worker.id} className="flex items-center justify-between border rounded-md p-3">
                    <div>
                      <div className="font-medium">{worker.name}</div>
                      <div className="text-xs text-muted-foreground">Clocked in: {clockIn}</div>
                    </div>
                    <Badge variant="secondary">{worker.project}</Badge>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {mockData.recentEntries.map((entry) => (
                <li key={entry.id} className="border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{entry.name}</div>
                    <Badge variant="outline">{formatDuration(entry.hours)}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{entry.project}</div>
                  <div className="text-xs text-muted-foreground">{entry.date}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
