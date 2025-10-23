import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AutoClockoutReportTable } from "@/components/admin/auto-clockout-report-table"
import { LocationComplianceTable } from "@/components/admin/location-compliance-table"
import { ReportStats } from "@/components/admin/report-stats"
import { AlertTriangle, MapPin, Clock } from "lucide-react"

export default function AdminReportsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Time Clock Reports</h1>
        <p className="text-muted-foreground mt-2">Monitor auto clock-outs and location compliance</p>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <ReportStats />
      </Suspense>

      <Tabs defaultValue="auto-clockout" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="auto-clockout" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Auto Clock-Outs
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auto-clockout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Auto Clock-Out History
              </CardTitle>
              <CardDescription>
                Employees who were automatically clocked out after not responding to reminders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading reports...</div>}>
                <AutoClockoutReportTable />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                Location Verification History
              </CardTitle>
              <CardDescription>Clock-in locations and distance from project sites</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading reports...</div>}>
                <LocationComplianceTable />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
