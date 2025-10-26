"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, CheckCircle2 } from "lucide-react"
import type { Task } from "@/lib/actions/task-actions"

interface TaskCardProps {
  task: Task
  onClick?: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  // Determine priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Determine status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "on track":
        return "bg-green-100 text-green-800"
      case "attention":
        return "bg-yellow-100 text-yellow-800"
      case "at risk":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  // Format date
  const formatDate = (date: string) => {
    if (!date) return "No date"
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return date
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">{task.item}</CardTitle>
            {task.category && <CardDescription className="mt-1">{task.category}</CardDescription>}
          </div>
          {task.isComplete && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Priority and Status */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
          <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
        </div>

        {/* Due Date */}
        {task.dateDue && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Due: {formatDate(task.dateDue)}</span>
            {task.timeDue && (
              <>
                <Clock className="w-4 h-4 ml-2" />
                <span>{task.timeDue}</span>
              </>
            )}
          </div>
        )}

        {/* Completion Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{task.completionPercentage}%</span>
          </div>
          <Progress value={task.completionPercentage} className="h-2" />
        </div>

        {/* Description preview */}
        {task.description && <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>}
      </CardContent>
    </Card>
  )
}
