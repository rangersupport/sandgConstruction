"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogIn, LogOut, Loader2, Clock } from "lucide-react"
import { toast } from "sonner"
import { adminClockIn, adminClockOut } from "@/lib/actions/admin-actions"

interface Employee {
  id: string
  name: string
  email?: string
  phone?: string
  cell?: string
  role?: string
  status?: string
  hourly_wage?: string
  department?: string
  isClockedIn?: boolean
  currentTimeEntry?: {
    id: string
    clock_in: string
    project: {
      id: string
      name: string
    }
  } | null
}

interface Project {
  id: string
  name: string
}

interface EmployeeListWithActionsProps {
  employees: Employee[]
  projects: Project[]
}

export function EmployeeListWithActions({ employees: initialEmployees, projects }: EmployeeListWithActionsProps) {
  const router = useRouter()
  const [employees, setEmployees] = useState(initialEmployees)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedProject, setSelectedProject] = useState("")
  const [clockInNotes, setClockInNotes] = useState("")
  const [isClockInDialogOpen, setIsClockInDialogOpen] = useState(false)
  const [isClockOutDialogOpen, setIsClockOutDialogOpen] = useState(false)
  const [employeeToClockOut, setEmployeeToClockOut] = useState<Employee | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  async function handleClockIn() {
    if (!selectedEmployee || !selectedProject) {
      toast.error("Please select a project")
      return
    }

    setActionLoading(true)
    try {
      const result = await adminClockIn(
        selectedEmployee.id,
        selectedProject,
        undefined,
        undefined,
        clockInNotes || "Manually clocked in by admin",
      )

      if (result.success) {
        toast.success(`${selectedEmployee.name} has been clocked in`)
        setIsClockInDialogOpen(false)
        setSelectedEmployee(null)
        setSelectedProject("")
        setClockInNotes("")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to clock in employee")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleClockOut(employee: Employee) {
    if (!employee.currentTimeEntry) return

    setActionLoading(true)
    try {
      const result = await adminClockOut(employee.currentTimeEntry.id)

      if (result.success) {
        toast.success(`${employee.name} has been clocked out`)
        setIsClockOutDialogOpen(false)
        setEmployeeToClockOut(null)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to clock out employee")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employees.map((employee) => (
          <Card key={employee.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{employee.name}</CardTitle>
                {employee.isClockedIn && (
                  <Badge variant="default" className="gap-1">
                    <Clock className="w-3 h-3" />
                    Clocked In
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {employee.isClockedIn && employee.currentTimeEntry && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    {employee.currentTimeEntry.project.name}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Since {new Date(employee.currentTimeEntry.clock_in).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {((Date.now() - new Date(employee.currentTimeEntry.clock_in).getTime()) / 3600000).toFixed(1)}h
                    elapsed
                  </p>
                </div>
              )}

              <div className="space-y-2">
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
              </div>

              <div className="flex gap-2 pt-2">
                {employee.isClockedIn ? (
                  <Button
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      setEmployeeToClockOut(employee)
                      setIsClockOutDialogOpen(true)
                    }}
                    disabled={actionLoading}
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Clock Out
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      setSelectedEmployee(employee)
                      setIsClockInDialogOpen(true)
                    }}
                    disabled={actionLoading}
                  >
                    <LogIn className="w-4 h-4 mr-1" />
                    Clock In
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Clock In Dialog */}
      <Dialog open={isClockInDialogOpen} onOpenChange={setIsClockInDialogOpen}>
        <DialogContent className="bg-white text-gray-900 dark:bg-white dark:text-gray-900">
          <DialogHeader>
            <DialogTitle>Clock In Employee</DialogTitle>
            <DialogDescription className="text-gray-600">Manually clock in {selectedEmployee?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Project *</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Reason for manual clock-in..."
                value={clockInNotes}
                onChange={(e) => setClockInNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsClockInDialogOpen(false)
                setSelectedEmployee(null)
                setSelectedProject("")
                setClockInNotes("")
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleClockIn} disabled={actionLoading || !selectedProject}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Clock In"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clock Out Confirmation Dialog */}
      <AlertDialog open={isClockOutDialogOpen} onOpenChange={setIsClockOutDialogOpen}>
        <AlertDialogContent className="bg-white text-gray-900 dark:bg-white dark:text-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle>Clock Out Confirmation</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              {employeeToClockOut && employeeToClockOut.currentTimeEntry && (
                <div className="space-y-2 mt-2">
                  <p>
                    <strong>{employeeToClockOut.name}</strong> will be clocked out from:
                  </p>
                  <p className="font-medium">{employeeToClockOut.currentTimeEntry.project.name}</p>
                  <p>
                    Clocked in at:{" "}
                    {new Date(employeeToClockOut.currentTimeEntry.clock_in).toLocaleString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                  <p>
                    Time worked:{" "}
                    {(
                      (Date.now() - new Date(employeeToClockOut.currentTimeEntry.clock_in).getTime()) /
                      3600000
                    ).toFixed(2)}{" "}
                    hours
                  </p>
                  <p className="mt-4">Are you sure you want to clock out this employee?</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsClockOutDialogOpen(false)
                setEmployeeToClockOut(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (employeeToClockOut) {
                  handleClockOut(employeeToClockOut)
                }
              }}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Clock Out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
