import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function EmployeesPage() {
  const supabase = await createClient()

  const { data: employees } = await supabase.from("employees").select("*").order("first_name", { ascending: true })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Employees</h1>
        <p className="text-sm text-muted-foreground">Manage your construction team</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(employees || []).map((employee) => (
          <Card key={employee.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                {employee.first_name} {employee.last_name}
              </CardTitle>
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
