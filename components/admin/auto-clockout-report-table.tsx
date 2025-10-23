import { getAutoClockoutReports } from "@/lib/actions/admin-actions"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle } from "lucide-react"

export async function AutoClockoutReportTable() {
  const reports = await getAutoClockoutReports()

  if (reports.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No auto clock-outs found. This is good news!</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Clock In</TableHead>
            <TableHead>Auto Clock Out</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Distance</TableHead>
            <TableHead>Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{report.employee_name}</TableCell>
              <TableCell>{report.project_name}</TableCell>
              <TableCell>{new Date(report.clock_in).toLocaleString()}</TableCell>
              <TableCell>{new Date(report.auto_clockout_at).toLocaleString()}</TableCell>
              <TableCell>{report.hours_worked.toFixed(2)}</TableCell>
              <TableCell>{report.distance_from_project.toFixed(0)}m</TableCell>
              <TableCell>
                {report.location_verified ? (
                  <Badge variant="default" className="flex items-center gap-1 w-fit">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                    <XCircle className="w-3 h-3" />
                    Unverified
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
