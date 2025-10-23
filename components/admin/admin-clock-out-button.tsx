"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { adminClockOut } from "@/lib/actions/admin-actions"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface AdminClockOutButtonProps {
  timeEntryId: string
  employeeName: string
}

export function AdminClockOutButton({ timeEntryId, employeeName }: AdminClockOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleClockOut = async () => {
    setIsLoading(true)
    try {
      const result = await adminClockOut(timeEntryId)
      if (result.success) {
        toast.success(`${employeeName} has been clocked out`)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to clock out employee")
      }
    } catch (error) {
      toast.error("An error occurred while clocking out")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <LogOut className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clock Out Employee</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to clock out {employeeName}? This action will end their current shift.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleClockOut} disabled={isLoading}>
            {isLoading ? "Clocking Out..." : "Clock Out"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
