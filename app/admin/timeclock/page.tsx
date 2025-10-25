import { TimeClockDashboard } from "@/components/admin/time-clock-dashboard"

export default async function AdminTimeClockPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Time Clock Management</h1>
        <p className="text-muted-foreground mt-2">
          Manually manage employee clock-ins and clock-outs for situations like forgotten devices, no signal, or missed
          clock-outs
        </p>
      </div>
      <TimeClockDashboard />
    </div>
  )
}
