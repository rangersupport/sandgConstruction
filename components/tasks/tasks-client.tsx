"use client"

import { useState } from "react"
import { TaskCard } from "@/components/tasks/task-card"
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog"
import { getEmployeeTasks, type Task } from "@/lib/actions/task-actions"

interface TasksClientProps {
  initialTasks: Task[]
  employeeId: string
}

export function TasksClient({ initialTasks, employeeId }: TasksClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setDialogOpen(true)
  }

  const handleTaskUpdated = async () => {
    // Refresh tasks from FileMaker after update
    const updatedTasks = await getEmployeeTasks(employeeId)
    setTasks(updatedTasks)
  }

  return (
    <>
      {/* Active Tasks */}
      {tasks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Active Tasks
            <span className="text-sm font-normal text-slate-600 ml-2">(Completed tasks are automatically hidden)</span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard key={task.recordId} task={task} onClick={() => handleTaskClick(task)} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-slate-600">No active tasks assigned</p>
          <p className="text-sm text-slate-500 mt-2">
            Tasks assigned to you will appear here. Completed tasks are automatically hidden.
          </p>
        </div>
      )}

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        task={selectedTask}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onTaskUpdated={handleTaskUpdated}
      />
    </>
  )
}
