"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { updateTaskCompletion, updateTaskStatus, updateTaskNotes, type Task } from "@/lib/actions/task-actions"
import { Calendar, Clock, Loader2 } from "lucide-react"

interface TaskDetailDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskUpdated: () => void
}

export function TaskDetailDialog({ task, open, onOpenChange, onTaskUpdated }: TaskDetailDialogProps) {
  const { toast } = useToast()
  const [completion, setCompletion] = useState(task?.completionPercentage || 0)
  const [status, setStatus] = useState(task?.status || "Normal")
  const [notes, setNotes] = useState(task?.notes || "")
  const [isSaving, setIsSaving] = useState(false)

  // Update local state when task changes
  if (task && completion !== task.completionPercentage) {
    setCompletion(task.completionPercentage)
  }
  if (task && status !== task.status) {
    setStatus(task.status)
  }
  if (task && notes !== task.notes) {
    setNotes(task.notes)
  }

  if (!task) return null

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Update completion percentage
      if (completion !== task.completionPercentage) {
        const result = await updateTaskCompletion(task.recordId, completion)
        if (!result.success) {
          throw new Error(result.error || "Failed to update completion")
        }
      }

      // Update status
      if (status !== task.status) {
        const result = await updateTaskStatus(task.recordId, status)
        if (!result.success) {
          throw new Error(result.error || "Failed to update status")
        }
      }

      // Update notes
      if (notes !== task.notes) {
        const result = await updateTaskNotes(task.recordId, notes)
        if (!result.success) {
          throw new Error(result.error || "Failed to update notes")
        }
      }

      toast({
        title: "Task updated",
        description: "Your changes have been saved to FileMaker.",
      })

      onTaskUpdated()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

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

  const statusOptions = ["Normal", "On Track", "Attention", "At Risk"]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.item}</DialogTitle>
          {task.category && <DialogDescription>{task.category}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Task Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Due:</span>
              <span className="font-medium">{formatDate(task.dateDue)}</span>
              {task.timeDue && (
                <>
                  <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                  <span className="font-medium">{task.timeDue}</span>
                </>
              )}
            </div>

            {task.description && (
              <div className="text-sm">
                <span className="text-muted-foreground">Description:</span>
                <p className="mt-1">{task.description}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Badge variant="outline">{task.priority}</Badge>
              <Badge variant="outline">{task.statusDisplay}</Badge>
            </div>
          </div>

          {/* Completion Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Completion Progress</label>
              <span className="text-sm font-bold">{completion}%</span>
            </div>
            <Slider
              value={[completion]}
              onValueChange={(value) => setCompletion(value[0])}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Drag the slider to update task completion. Setting to 100% will automatically close the task.
            </p>
          </div>

          {/* Status Buttons */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Task Status</label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => (
                <Button
                  key={option}
                  variant={status === option ? "default" : "outline"}
                  onClick={() => setStatus(option)}
                  className="w-full"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes or updates about this task..."
              rows={4}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
