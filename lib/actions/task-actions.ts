"use server"

import { fileMaker } from "@/lib/filemaker/client"

// FileMaker T19_TASKS layout name
const TASKS_LAYOUT = "L1405_TASKS_List_webApp"

// Task field mappings from FileMaker
const TASK_FIELDS = {
  ID_TASK: "id_Task",
  ITEM: "Item",
  DESCRIPTION: "Description",
  ID_STAFF: "id_staff",
  STAFF_NAME: "Staff_Name",
  ID_PROJECT: "id_Project",
  DATE_DUE: "Date_Due",
  TIME_DUE: "Time_Due",
  DATE_END: "Date_End",
  TIME_END: "Time_End",
  PRIORITY: "Priority",
  STATUS: "Status",
  TASK_COMPLETION_PERCENTAGE: "Task_Completion_Percentage",
  NOTES: "Notes",
  CATEGORY: "Category",
  FLAG_COMPLETE: "Flag_Complete",
}

export interface Task {
  id: string
  recordId: string
  item: string
  description: string
  staffId: string
  staffName: string
  projectId: string
  dateDue: string
  timeDue: string
  dateEnd: string
  timeEnd: string
  priority: string
  status: string
  completionPercentage: number
  notes: string
  category: string
  isComplete: boolean
}

// Get all tasks assigned to a specific employee
export async function getEmployeeTasks(employeeId: string): Promise<Task[]> {
  console.log("[v0] Getting tasks for employee:", employeeId)

  try {
    // Query FileMaker for tasks assigned to this employee
    const result = await fileMaker.findRecords(TASKS_LAYOUT, [
      {
        [TASK_FIELDS.ID_STAFF]: employeeId,
      },
    ])

    console.log("[v0] FileMaker tasks result:", JSON.stringify(result, null, 2))

    if (!result.response?.data) {
      console.log("[v0] No tasks found for employee")
      return []
    }

    const tasks: Task[] = result.response.data.map((record: any) => ({
      id: record.fieldData[TASK_FIELDS.ID_TASK] || "",
      recordId: record.recordId,
      item: record.fieldData[TASK_FIELDS.ITEM] || "",
      description: record.fieldData[TASK_FIELDS.DESCRIPTION] || "",
      staffId: record.fieldData[TASK_FIELDS.ID_STAFF] || "",
      staffName: record.fieldData[TASK_FIELDS.STAFF_NAME] || "",
      projectId: record.fieldData[TASK_FIELDS.ID_PROJECT] || "",
      dateDue: record.fieldData[TASK_FIELDS.DATE_DUE] || "",
      timeDue: record.fieldData[TASK_FIELDS.TIME_DUE] || "",
      dateEnd: record.fieldData[TASK_FIELDS.DATE_END] || "",
      timeEnd: record.fieldData[TASK_FIELDS.TIME_END] || "",
      priority: record.fieldData[TASK_FIELDS.PRIORITY] || "Medium",
      status: record.fieldData[TASK_FIELDS.STATUS] || "Normal",
      completionPercentage: Number(record.fieldData[TASK_FIELDS.TASK_COMPLETION_PERCENTAGE]) || 0,
      notes: record.fieldData[TASK_FIELDS.NOTES] || "",
      category: record.fieldData[TASK_FIELDS.CATEGORY] || "",
      isComplete: record.fieldData[TASK_FIELDS.FLAG_COMPLETE] === "1",
    }))

    console.log("[v0] Parsed tasks:", tasks.length)
    return tasks
  } catch (error) {
    console.error("[v0] Error fetching employee tasks:", error)
    return []
  }
}

// Update task completion percentage
export async function updateTaskCompletion(
  recordId: string,
  completionPercentage: number,
): Promise<{ success: boolean; error?: string }> {
  console.log("[v0] Updating task completion:", recordId, completionPercentage)

  try {
    await fileMaker.updateRecord(TASKS_LAYOUT, recordId, {
      [TASK_FIELDS.TASK_COMPLETION_PERCENTAGE]: completionPercentage.toString(),
    })

    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating task completion:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    }
  }
}

// Update task status
export async function updateTaskStatus(
  recordId: string,
  status: string,
): Promise<{ success: boolean; error?: string }> {
  console.log("[v0] Updating task status:", recordId, status)

  try {
    await fileMaker.updateRecord(TASKS_LAYOUT, recordId, {
      [TASK_FIELDS.STATUS]: status,
    })

    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating task status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task status",
    }
  }
}

// Update task notes
export async function updateTaskNotes(recordId: string, notes: string): Promise<{ success: boolean; error?: string }> {
  console.log("[v0] Updating task notes:", recordId)

  try {
    await fileMaker.updateRecord(TASKS_LAYOUT, recordId, {
      [TASK_FIELDS.NOTES]: notes,
    })

    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating task notes:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task notes",
    }
  }
}
