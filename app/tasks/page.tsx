import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getEmployeeTasks } from "@/lib/actions/task-actions"
import { TaskCard } from "@/components/tasks/task-card"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function TasksPage() {
  const cookieStore = await cookies()
  const employeeId = cookieStore.get("employee_id")?.value

  if (!employeeId) {
    redirect("/employee/login")
  }

  const tasks = await getEmployeeTasks(employeeId)

  // Separate tasks by completion status
  const activeTasks = tasks.filter((task) => !task.isComplete)
  const completedTasks = tasks.filter((task) => task.isComplete)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Tasks</h1>
            <p className="text-slate-600 mt-1">
              {activeTasks.length} active • {completedTasks.length} completed
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>

        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Active Tasks</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeTasks.map((task) => (
                <TaskCard key={task.recordId} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Completed Tasks</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedTasks.map((task) => (
                <TaskCard key={task.recordId} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-slate-600">No tasks assigned yet</p>
            <p className="text-sm text-slate-500 mt-2">Tasks assigned to you will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
