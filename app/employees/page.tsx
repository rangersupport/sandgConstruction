import { Badge } from "@/components/ui/badge"
import { NewEmployeeDialog } from "@/components/employees/new-employee-dialog"
import { getAllEmployeesFileMaker } from "@/lib/actions/filemaker-employee-actions"
import { getAllEmployeesWithStatus } from "@/lib/actions/admin-actions"
import { getActiveProjects } from "@/lib/actions/time-entry-actions"
import { EmployeeListWithActions } from "@/components/employees/employee-list-with-actions"

export default async function EmployeesPage() {
  const [employeesWithStatus, projectsResult] = await Promise.all([getAllEmployeesWithStatus(), getActiveProjects()])

  // Fallback to FileMaker employees if status fetch fails
  const fileMakerResult = await getAllEmployeesFileMaker()
  const fileMakerEmployees = fileMakerResult.success ? fileMakerResult.employees : []

  // Merge FileMaker employee data with status data
  const employees = employeesWithStatus.map((empStatus) => {
    const fmEmployee = fileMakerEmployees.find((fmEmp) => fmEmp.id === empStatus.id)
    return {
      ...empStatus,
      ...fmEmployee,
      isClockedIn: empStatus.isClockedIn,
      currentTimeEntry: empStatus.currentTimeEntry,
    }
  })

  const clockedInCount = employees.filter((e) => e.isClockedIn).length
  const availableCount = employees.length - clockedInCount

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Employees</h1>
          <p className="text-sm text-muted-foreground">Manage your construction team</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="gap-1">
            {clockedInCount} Clocked In
          </Badge>
          <Badge variant="secondary" className="gap-1">
            {availableCount} Available
          </Badge>
          <NewEmployeeDialog />
        </div>
      </div>

      {!fileMakerResult.success && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">Failed to load employees from FileMaker: {fileMakerResult.error}</p>
        </div>
      )}

      <EmployeeListWithActions employees={employees} projects={projectsResult} />

      {employees.length === 0 && fileMakerResult.success && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No employees found in FileMaker</p>
        </div>
      )}
    </div>
  )
}
