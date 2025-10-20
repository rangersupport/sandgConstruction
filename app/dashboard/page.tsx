import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Sparkline from './Sparkline';
import { Badge } from '@/components/ui/badge';

type ActiveWorkerRow = {
  id: string;
  clock_in: string;
  employee: { id: string; first_name: string; last_name: string } | null;
  project: { id: string; name: string } | null;
};

type RecentEntryRow = {
  id: string;
  clock_in: string;
  clock_out: string | null;
  hours_worked: number | null;
  updated_at: string;
  employee: { id: string; first_name: string; last_name: string } | null;
  project: { id: string; name: string } | null;
};

function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // Active workers
  const { data: activeWorkersData } = await supabase
    .from('time_entries')
    .select(
      `id, clock_in, employee:employee_id ( id, first_name, last_name ), project:project_id ( id, name )`
    )
    .eq('status', 'clocked_in')
    .order('clock_in', { ascending: false });
  const activeWorkers = (activeWorkersData || []) as unknown as ActiveWorkerRow[];

  // Counts
  const [employeesCountRes, projectsCountRes] = await Promise.all([
    supabase.from('employees').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active')
  ]);
  const totalEmployees = employeesCountRes.count || 0;
  const activeProjects = projectsCountRes.count || 0;

  // This week hours
  const startOfWeek = new Date();
  const day = startOfWeek.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday as start
  startOfWeek.setDate(startOfWeek.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);
  const { data: weekEntries } = await supabase
    .from('time_entries')
    .select('hours_worked, clock_in, clock_out, status')
    .gte('clock_in', startOfWeek.toISOString());
  const thisWeekHours = (weekEntries || []).reduce((sum, e) => sum + (e.hours_worked || 0), 0);

  // Recent activity
  const { data: recentData } = await supabase
    .from('time_entries')
    .select(
      `id, clock_in, clock_out, hours_worked, updated_at, employee:employee_id ( id, first_name, last_name ), project:project_id ( id, name )`
    )
    .order('updated_at', { ascending: false })
    .limit(5);
  const recentEntries = (recentData || []) as unknown as RecentEntryRow[];

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
            <Sparkline data={Array.from({ length: 14 }, (_, i) => ({ x: i, y: (activeWorkers.length || 1) + Math.random() * 2 }))} />
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
                  const employeeName = row.employee
                    ? `${row.employee.first_name} ${row.employee.last_name}`
                    : 'Unknown Employee';
                  const projectName = row.project ? row.project.name : 'Unknown Project';
                  const clockIn = new Date(row.clock_in).toLocaleString();
                  return (
                    <li key={row.id} className="flex items-center justify-between border rounded-md p-3">
                      <div>
                        <div className="font-medium">{employeeName}</div>
                        <div className="text-xs text-muted-foreground">Clocked in: {clockIn}</div>
                      </div>
                      <Badge variant="secondary">{projectName}</Badge>
                    </li>
                  );
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
                  const employeeName = row.employee
                    ? `${row.employee.first_name} ${row.employee.last_name}`
                    : 'Unknown Employee';
                  const projectName = row.project ? row.project.name : 'Unknown Project';
                  const duration = row.hours_worked != null
                    ? formatDuration(row.hours_worked)
                    : formatDuration(Math.max(0, (Date.now() - new Date(row.clock_in).getTime()) / 3600000));
                  return (
                    <li key={row.id} className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{employeeName}</div>
                        <Badge variant="outline">{duration}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{projectName}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


