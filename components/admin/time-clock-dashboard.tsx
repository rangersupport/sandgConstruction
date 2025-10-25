"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Clock, LogIn, LogOut, Edit, Users, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { adminClockIn, adminClockOut, getAllEmployeesWithStatus, adminEditTimeEntry } from "@/lib/actions/admin-actions"
import { getAllProjects } from "@/lib/actions/project-actions"

interface Employee {
  id: string
  name: string
  email?: string
  phone?: string
  role?: string
  status?: string
  isClockedIn: boolean
  currentTimeEntry?: {
    id: string
    clock_in: string
    clock_in_lat?: number
    clock_in_lng?: number
    project: {
      id: string
      name: string
      address?: string
    }
  } | null
}

interface Project {
  id: string
  name: string
  address?: string
}

export function TimeClockDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedProject, setSelectedProject] = useState("")
  const [clockInNotes, setClockInNotes] = useState("")
  const [isClockInDialogOpen, setIsClockInDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isClockOutDialogOpen, setIsClockOutDialogOpen] = useState(false)
  const [employeeToClockOut, setEmployeeToClockOut] = useState<Employee | null>(null)
  const [editClockIn, setEditClockIn] = useState("")
  const [editClockOut, setEditClockOut] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [employeesData, projectsData] = await Promise.all([getAllEmployeesWithStatus(), getAllProjects()])
      setEmployees(employeesData)
      setProjects(projectsData)
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  async function handleClockIn() {
    if (!selectedEmployee || !selectedProject) {
      toast.error("Please select an employee and project")
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
        await loadData()
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
        await loadData()
      } else {
        toast.error(result.error || "Failed to clock out employee")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleEditTimeEntry() {
    if (!selectedEmployee?.currentTimeEntry) return

    setActionLoading(true)
    try {
      const updates: any = {}
      if (editClockIn) updates.clock_in = new Date(editClockIn).toISOString()
      if (editClockOut) updates.clock_out = new Date(editClockOut).toISOString()
      if (editNotes) updates.notes = editNotes

      const result = await adminEditTimeEntry(selectedEmployee.currentTimeEntry.id, updates)

      if (result.success) {
        toast.success("Time entry updated successfully")
        setIsEditDialogOpen(false)
        setSelectedEmployee(null)
        setEditClockIn("")
        setEditClockOut("")
        setEditNotes("")
        await loadData()
      } else {
        toast.error(result.error || "Failed to update time entry")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setActionLoading(false)
    }
  }

  const filteredEmployees = employees.filter((emp) => emp.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const clockedInCount = employees.filter((e) => e.isClockedIn).length
  const clockedOutCount = employees.length - clockedInCount

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time Clock Dashboard
            </CardTitle>
            <CardDescription>Manage employee clock-ins and clock-outs</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1">
              <Users className="w-3 h-3" />
              {clockedInCount} Clocked In
            </Badge>
            <Badge variant="secondary" className="gap-1">
              {clockedOutCount} Available
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button onClick={loadData} variant="outline" size="icon">
            <Clock className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{employee.name}</h4>
                  {employee.isClockedIn ? (
                    <Badge variant="default" className="gap-1">
                      <Clock className="w-3 h-3" />
                      Clocked In
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Available</Badge>
                  )}
                </div>
                {employee.currentTimeEntry && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    <p className="font-medium">{employee.currentTimeEntry.project.name}</p>
                    <p>
                      Since {new Date(employee.currentTimeEntry.clock_in).toLocaleTimeString()} (
                      {((Date.now() - new Date(employee.currentTimeEntry.clock_in).getTime()) / 3600000).toFixed(1)}
                      h)
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {employee.isClockedIn ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEmployee(employee)
                        if (employee.currentTimeEntry) {
                          setEditClockIn(new Date(employee.currentTimeEntry.clock_in).toISOString().slice(0, 16))
                        }
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setEmployeeToClockOut(employee)
                        setIsClockOutDialogOpen(true)
                      }}
                      disabled={actionLoading}
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      Clock Out
                    </Button>
                  </>
                ) : (
                  <Dialog open={isClockInDialogOpen} onOpenChange={setIsClockInDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="default" size="sm" onClick={() => setSelectedEmployee(employee)}>
                        <LogIn className="w-4 h-4 mr-1" />
                        Clock In
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Clock In Employee</DialogTitle>
                        <DialogDescription>Manually clock in {selectedEmployee?.name}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Project</Label>
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
                        <Button onClick={handleClockIn} disabled={actionLoading}>
                          {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Clock In"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          ))}
        </div>

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

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Time Entry</DialogTitle>
              <DialogDescription>Adjust clock-in/out times for {selectedEmployee?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Clock In Time</Label>
                <Input type="datetime-local" value={editClockIn} onChange={(e) => setEditClockIn(e.target.value)} />
              </div>
              <div>
                <Label>Clock Out Time (Optional)</Label>
                <Input type="datetime-local" value={editClockOut} onChange={(e) => setEditClockOut(e.target.value)} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="Reason for adjustment..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setSelectedEmployee(null)
                  setEditClockIn("")
                  setEditClockOut("")
                  setEditNotes("")
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditTimeEntry} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
