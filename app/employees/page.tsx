import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NewEmployeeDialog } from "@/components/employees/new-employee-dialog"
import { getAllEmployeesFileMaker } from "@/lib/actions/filemaker-employee-actions"

export default async function EmployeesPage() {
  const result = await getAllEmployeesFileMaker()
  const employees = result.success ? result.employees : []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Employees</h1>
          <p className="text-sm text-muted-foreground">Manage your construction team</p>
        </div>
        <NewEmployeeDialog />
      </div>

      {!result.success && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">Failed to load employees from FileMaker: {result.error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employees.map((employee) => (
          <Card key={employee.id}>
            <CardHeader>
              <CardTitle className="text-lg">{employee.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role:</span>
                <Badge variant="outline">{employee.role || "N/A"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                  {employee.status || "N/A"}
                </Badge>
              </div>
              {employee.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Phone:</span>
                  <span className="text-sm">{employee.phone}</span>
                </div>
              )}
              {employee.cell && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cell:</span>
                  <span className="text-sm">{employee.cell}</span>
                </div>
              )}
              {employee.email && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm truncate max-w-[200px]">{employee.email}</span>
                </div>
              )}
              {employee.hourly_wage && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hourly Rate:</span>
                  <span className="text-sm font-semibold">${employee.hourly_wage}/hr</span>
                </div>
              )}
              {employee.department && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Department:</span>
                  <span className="text-sm">{employee.department}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {employees.length === 0 && result.success && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No employees found in FileMaker</p>
        </div>
      )}
    </div>
  )
}
