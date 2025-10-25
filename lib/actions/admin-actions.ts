"use server"

import { fileMaker } from "@/lib/filemaker/client"
import { FILEMAKER_LAYOUTS, TIME_ENTRY_FIELDS, EMPLOYEE_FIELDS, PROJECT_FIELDS } from "@/lib/filemaker/config"
import { formatDateForFileMaker, parseDateFromFileMaker } from "@/lib/filemaker/utils"
import { revalidatePath } from "next/cache"

export interface AutoClockoutReport {
  id: string
  employee_name: string
  project_name: string
  clock_in: string
  clock_out: string
  hours_worked: number
  reminder_sent_at: string
  auto_clockout_at: string
  distance_from_project: number
  location_verified: boolean
}

export interface LocationComplianceReport {
  id: string
  employee_name: string
  project_name: string
  clock_in: string
  distance_from_project: number
  location_verified: boolean
  clock_in_lat: number
  clock_in_lng: number
  project_lat: number
  project_lng: number
}

export async function adminClockOut(timeEntryId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const clockOutTime = new Date()
    const clockOutTimeFormatted = formatDateForFileMaker(clockOutTime)

    await fileMaker.updateRecord(FILEMAKER_LAYOUTS.TIME_ENTRIES, timeEntryId, {
      [TIME_ENTRY_FIELDS.CLOCK_OUT]: clockOutTimeFormatted,
      [TIME_ENTRY_FIELDS.STATUS]: "clocked_out",
    })

    revalidatePath("/map")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error clocking out employee:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clock out",
    }
  }
}

export async function adminClockIn(
  employeeId: string,
  projectId: string,
  latitude?: number,
  longitude?: number,
  notes?: string,
): Promise<{ success: boolean; error?: string; timeEntryId?: string }> {
  try {
    const existingResult = await fileMaker.findRecords(FILEMAKER_LAYOUTS.TIME_ENTRIES, [
      {
        [TIME_ENTRY_FIELDS.EMPLOYEE_ID]: employeeId,
        [TIME_ENTRY_FIELDS.STATUS]: "clocked_in",
      },
    ])

    if (existingResult.response.data && existingResult.response.data.length > 0) {
      return {
        success: false,
        error: "Employee is already clocked in",
      }
    }

    // Get employee name
    const employeeResult = await fileMaker.findRecords(FILEMAKER_LAYOUTS.EMPLOYEES, [
      { [EMPLOYEE_FIELDS.EMPLOYEE_LOGIN_NUMBER]: employeeId },
    ])

    if (!employeeResult.response.data || employeeResult.response.data.length === 0) {
      return {
        success: false,
        error: "Employee not found",
      }
    }

    const employeeName = `${employeeResult.response.data[0].fieldData[EMPLOYEE_FIELDS.FIRST_NAME]} ${employeeResult.response.data[0].fieldData[EMPLOYEE_FIELDS.LAST_NAME]}`

    // Get project name
    const projectResult = await fileMaker.findRecords(FILEMAKER_LAYOUTS.PROJECTS, [{ [PROJECT_FIELDS.ID]: projectId }])

    const projectName =
      projectResult.response.data && projectResult.response.data.length > 0
        ? projectResult.response.data[0].fieldData[PROJECT_FIELDS.NAME]
        : "Unknown Project"

    const clockInTime = new Date()
    const clockInTimeFormatted = formatDateForFileMaker(clockInTime)

    const result = await fileMaker.createRecord(FILEMAKER_LAYOUTS.TIME_ENTRIES, {
      [TIME_ENTRY_FIELDS.EMPLOYEE_ID]: employeeId,
      [TIME_ENTRY_FIELDS.EMPLOYEE_NAME]: employeeName,
      [TIME_ENTRY_FIELDS.PROJECT_ID]: projectId,
      [TIME_ENTRY_FIELDS.PROJECT_NAME]: projectName,
      [TIME_ENTRY_FIELDS.CLOCK_IN]: clockInTimeFormatted,
      [TIME_ENTRY_FIELDS.STATUS]: "clocked_in",
      [TIME_ENTRY_FIELDS.CLOCK_IN_LAT]: latitude,
      [TIME_ENTRY_FIELDS.CLOCK_IN_LNG]: longitude,
      [TIME_ENTRY_FIELDS.NOTES]: notes || "Manually clocked in by admin",
    })

    revalidatePath("/map")
    revalidatePath("/dashboard")

    return {
      success: true,
      timeEntryId: result.response.recordId,
    }
  } catch (error) {
    console.error("[v0] Error manually clocking in employee:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clock in",
    }
  }
}

export async function getAllEmployeesWithStatus() {
  try {
    const employeesResult = await fileMaker.getRecords(FILEMAKER_LAYOUTS.EMPLOYEES, 200)

    if (!employeesResult.response.data) {
      console.log("[v0] No employees found in FileMaker")
      return []
    }

    console.log("[v0] Found", employeesResult.response.data.length, "employees in FileMaker")

    // Get current clock-in status for each employee
    const employeesWithStatus = await Promise.all(
      employeesResult.response.data.map(async (record: any) => {
        const employeeId = record.fieldData[EMPLOYEE_FIELDS.EMPLOYEE_LOGIN_NUMBER]
        const firstName = record.fieldData[EMPLOYEE_FIELDS.FIRST_NAME] || ""
        const lastName = record.fieldData[EMPLOYEE_FIELDS.LAST_NAME] || ""
        const name = `${firstName} ${lastName}`.trim()
        const status = record.fieldData[EMPLOYEE_FIELDS.STATUS]

        // Skip if no employee ID or name
        if (!employeeId || !name) {
          return null
        }

        // Check if employee is clocked in
        try {
          const timeEntryResult = await fileMaker.findRecords(FILEMAKER_LAYOUTS.TIME_ENTRIES, [
            {
              [TIME_ENTRY_FIELDS.EMPLOYEE_ID]: employeeId,
              [TIME_ENTRY_FIELDS.STATUS]: "clocked_in",
            },
          ])

          let currentTimeEntry = null
          if (timeEntryResult.response.data && timeEntryResult.response.data.length > 0) {
            const entry = timeEntryResult.response.data[0]
            const clockInParsed = parseDateFromFileMaker(entry.fieldData[TIME_ENTRY_FIELDS.CLOCK_IN])

            currentTimeEntry = {
              id: entry.recordId,
              clock_in: clockInParsed.toISOString(),
              clock_in_lat: entry.fieldData[TIME_ENTRY_FIELDS.CLOCK_IN_LAT],
              clock_in_lng: entry.fieldData[TIME_ENTRY_FIELDS.CLOCK_IN_LNG],
              project: {
                id: entry.fieldData[TIME_ENTRY_FIELDS.PROJECT_ID],
                name: entry.fieldData[TIME_ENTRY_FIELDS.PROJECT_NAME],
              },
            }
          }

          return {
            id: employeeId,
            name,
            email: record.fieldData[EMPLOYEE_FIELDS.EMAIL],
            phone: record.fieldData[EMPLOYEE_FIELDS.PHONE],
            role: record.fieldData[EMPLOYEE_FIELDS.WEB_ADMIN_ROLE],
            status,
            isClockedIn: !!currentTimeEntry,
            currentTimeEntry,
          }
        } catch (error) {
          console.error(`[v0] Error fetching time entry for employee ${employeeId}:`, error)
          return {
            id: employeeId,
            name,
            email: record.fieldData[EMPLOYEE_FIELDS.EMAIL],
            phone: record.fieldData[EMPLOYEE_FIELDS.PHONE],
            role: record.fieldData[EMPLOYEE_FIELDS.WEB_ADMIN_ROLE],
            status,
            isClockedIn: false,
            currentTimeEntry: null,
          }
        }
      }),
    )

    // Filter out null entries and return
    const validEmployees = employeesWithStatus.filter((emp) => emp !== null)
    console.log("[v0] Returning", validEmployees.length, "employees with status")
    return validEmployees
  } catch (error) {
    console.error("[v0] Error fetching employees with status:", error)
    return []
  }
}

export async function adminEditTimeEntry(
  timeEntryId: string,
  updates: {
    clock_in?: string
    clock_out?: string
    notes?: string
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    const fileMakerUpdates: any = {}

    if (updates.clock_in) {
      fileMakerUpdates[TIME_ENTRY_FIELDS.CLOCK_IN] = formatDateForFileMaker(new Date(updates.clock_in))
    }

    if (updates.clock_out) {
      fileMakerUpdates[TIME_ENTRY_FIELDS.CLOCK_OUT] = formatDateForFileMaker(new Date(updates.clock_out))
      fileMakerUpdates[TIME_ENTRY_FIELDS.STATUS] = "clocked_out"
    }

    if (updates.notes) {
      fileMakerUpdates[TIME_ENTRY_FIELDS.NOTES] = updates.notes
    }

    await fileMaker.updateRecord(FILEMAKER_LAYOUTS.TIME_ENTRIES, timeEntryId, fileMakerUpdates)

    revalidatePath("/map")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error editing time entry:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update time entry",
    }
  }
}
