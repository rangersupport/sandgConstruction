import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const mockEmployees = [
  { id: 1, name: "John Doe", role: "Foreman", status: "active", phone: "555-0101", email: "john.doe@sandg.com" },
  { id: 2, name: "Jane Smith", role: "Worker", status: "active", phone: "555-0102", email: "jane.smith@sandg.com" },
  { id: 3, name: "Maria Garcia", role: "Worker", status: "active", phone: "555-0103", email: "maria.garcia@sandg.com" },
  {
    id: 4,
    name: "David Johnson",
    role: "Foreman",
    status: "active",
    phone: "555-0104",
    email: "david.johnson@sandg.com",
  },
  {
    id: 5,
    name: "Sarah Williams",
    role: "Manager",
    status: "active",
    phone: "555-0105",
    email: "sarah.williams@sandg.com",
  },
]

export default function EmployeesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Employees</h1>
        <p className="text-sm text-muted-foreground">Manage your construction team</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockEmployees.map((employee) => (
          <Card key={employee.id}>
            <CardHeader>
              <CardTitle className="text-lg">{employee.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role:</span>
                <Badge variant="outline">{employee.role}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={employee.status === "active" ? "default" : "secondary"}>{employee.status}</Badge>
              </div>
              {employee.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Phone:</span>
                  <span className="text-sm">{employee.phone}</span>
                </div>
              )}
              {employee.email && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm truncate max-w-[200px]">{employee.email}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
