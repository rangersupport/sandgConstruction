import { getLocationComplianceReports } from "@/lib/actions/admin-actions"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

export async function LocationComplianceTable() {
  const reports = await getLocationComplianceReports()

  if (reports.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No location data available</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Clock In Time</TableHead>
            <TableHead>Distance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Coordinates</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => {
            const isCompliant = report.location_verified
            const isWarning = report.distance_from_project > 50 && report.distance_from_project <= 100

            return (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.employee_name}</TableCell>
                <TableCell>{report.project_name}</TableCell>
                <TableCell>{new Date(report.clock_in).toLocaleString()}</TableCell>
                <TableCell>
                  <span className={isCompliant ? "text-green-600" : isWarning ? "text-orange-600" : "text-red-600"}>
                    {report.distance_from_project.toFixed(0)}m
                  </span>
                </TableCell>
                <TableCell>
                  {isCompliant ? (
                    <Badge variant="default" className="flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </Badge>
                  ) : isWarning ? (
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit bg-orange-100 text-orange-800">
                      <AlertTriangle className="w-3 h-3" />
                      Warning
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                      <XCircle className="w-3 h-3" />
                      Failed
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {report.clock_in_lat.toFixed(6)}, {report.clock_in_lng.toFixed(6)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
