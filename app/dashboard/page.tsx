import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Sparkline from "./Sparkline"
import { Badge } from "@/components/ui/badge"
import { getActiveTimeEntries } from "@/lib/actions/time-entry-actions"
import { getAllEmployees } from "@/lib/actions/filemaker-employee-actions"
import { AdminClockOutButton } from "@/components/admin/admin-clock-out-button"

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
  const activeWorkers = await getActiveTimeEntries()
  const employees = await getAllEmployees()

  const activeWorkersData =
    activeWorkers?.map((worker) => ({
      id: worker.id,
      name: worker.employee_name || "Unknown",
      project: worker.project_name || "Unknown Project",
      clockIn: worker.clock_in,
    })) || []

  const totalEmployees = employees?.filter((e) => e.status === "active").length || 0

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
            <div className="text-3xl font-bold">{activeWorkersData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently clocked in</p>
            <Sparkline
              data={Array.from({ length: 14 }, (_, i) => ({
                x: i,
                y: Math.max(1, activeWorkersData.length + Math.random() * 2 - 1),
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
            <div className="text-3xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">127.5</div>
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
            {activeWorkersData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active workers</p>
            ) : (
              <ul className="space-y-3">
                {activeWorkersData.map((worker) => {
                  const clockIn = new Date(worker.clockIn).toLocaleString()
                  return (
                    <li key={worker.id} className="flex items-center justify-between border rounded-md p-3">
                      <div>
                        <div className="font-medium">{worker.name}</div>
                        <div className="text-xs text-muted-foreground">Clocked in: {clockIn}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{worker.project}</Badge>
                        <AdminClockOutButton timeEntryId={worker.id} employeeName={worker.name} />
                      </div>
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
            <ul className="space-y-3">
              {[
                { id: "1", name: "John Doe", project: "Residential Construction", hours: 8.5, date: "Today" },
                { id: "2", name: "Jane Smith", project: "Commercial Renovation", hours: 7.0, date: "Today" },
                { id: "3", name: "Maria Garcia", project: "Office Building", hours: 8.0, date: "Yesterday" },
                { id: "4", name: "David Johnson", project: "Residential Construction", hours: 9.0, date: "Yesterday" },
                { id: "5", name: "Sarah Williams", project: "Commercial Renovation", hours: 7.5, date: "2 days ago" },
              ].map((entry) => (
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
