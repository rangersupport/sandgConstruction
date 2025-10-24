import { ActiveEmployeesMap } from "@/components/map/active-employees-map"

export default async function MapPage() {
  return (
    <div className="container mx-auto p-6">
      <ActiveEmployeesMap />
    </div>
  )
}
