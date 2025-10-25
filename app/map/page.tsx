import { ActiveEmployeesMap } from "@/components/map/active-employees-map"
import { TimeClockDashboard } from "@/components/admin/time-clock-dashboard"

export default async function MapPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <TimeClockDashboard />
      <ActiveEmployeesMap />
    </div>
  )
}
