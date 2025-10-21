import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAutoClockoutStats, getLocationComplianceStats } from "@/lib/actions/admin-actions"
import { AlertTriangle, CheckCircle2, Clock, MapPin } from "lucide-react"

export async function ReportStats() {
  const autoClockoutStats = await getAutoClockoutStats()
  const locationStats = await getLocationComplianceStats()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Auto Clock-Outs</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{autoClockoutStats.total}</div>
          <p className="text-xs text-muted-foreground">{autoClockoutStats.totalHours.toFixed(1)} total hours</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Hours</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{autoClockoutStats.averageHours.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">Per auto clock-out</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Location Compliance</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{locationStats.complianceRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {locationStats.verified} of {locationStats.total} verified
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Distance</CardTitle>
          <MapPin className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{locationStats.averageDistance.toFixed(0)}m</div>
          <p className="text-xs text-muted-foreground">From project site</p>
        </CardContent>
      </Card>
    </div>
  )
}
