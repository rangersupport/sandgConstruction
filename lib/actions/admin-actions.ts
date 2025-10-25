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

    if (employeesResult.response.data.length > 0) {
      console.log("[v0] Sample employee data:", JSON.stringify(employeesResult.response.data[0].fieldData, null, 2))
    }

    // Get current clock-in status for each employee
    const employeesWithStatus = await Promise.all(
      employeesResult.response.data.map(async (record: any) => {
        const employeeId =
          record.fieldData[EMPLOYEE_FIELDS.EMPLOYEE_LOGIN_NUMBER] ||
          record.fieldData[EMPLOYEE_FIELDS.ID] ||
          record.recordId

        // Try to get full name first, then fall back to combining first and last
        let name = record.fieldData[EMPLOYEE_FIELDS.NAME_FULL]
        if (!name) {
          const firstName = record.fieldData[EMPLOYEE_FIELDS.NAME_FIRST] || ""
          const lastName = record.fieldData[EMPLOYEE_FIELDS.NAME_LAST] || ""
          name = `${firstName} ${lastName}`.trim()
        }

        const status = record.fieldData[EMPLOYEE_FIELDS.STATUS]

        if (!name) {
          console.log(
            "[v0] Skipping employee - missing name. Record ID:",
            record.recordId,
            "Field data:",
            record.fieldData,
          )
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
            phone: record.fieldData[EMPLOYEE_FIELDS.PHONE1],
            cell: record.fieldData[EMPLOYEE_FIELDS.CELL],
            role: record.fieldData[EMPLOYEE_FIELDS.CATEGORY],
            status,
            hourly_wage: record.fieldData[EMPLOYEE_FIELDS.HOURLY_RATE],
            department: record.fieldData[EMPLOYEE_FIELDS.DEPARTMENT],
            isClockedIn: !!currentTimeEntry,
            currentTimeEntry,
          }
        } catch (error) {
          console.error(`[v0] Error fetching time entry for employee ${employeeId}:`, error)
          return {
            id: employeeId,
            name,
            email: record.fieldData[EMPLOYEE_FIELDS.EMAIL],
            phone: record.fieldData[EMPLOYEE_FIELDS.PHONE1],
            cell: record.fieldData[EMPLOYEE_FIELDS.CELL],
            role: record.fieldData[EMPLOYEE_FIELDS.CATEGORY],
            status,
            hourly_wage: record.fieldData[EMPLOYEE_FIELDS.HOURLY_RATE],
            department: record.fieldData[EMPLOYEE_FIELDS.DEPARTMENT],
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

export async function getAutoClockoutReports(): Promise<AutoClockoutReport[]> {
  try {
    // For now, return empty array since we don't have auto-clockout tracking yet
    // This will be implemented when we add the auto-clockout feature
    return []
  } catch (error) {
    console.error("[v0] Error fetching auto clockout reports:", error)
    return []
  }
}

export async function getLocationComplianceReports(): Promise<LocationComplianceReport[]> {
  try {
    // Get all time entries with location data
    const result = await fileMaker.getRecords(FILEMAKER_LAYOUTS.TIME_ENTRIES, 200)

    if (!result.response.data) {
      return []
    }

    const reports: LocationComplianceReport[] = result.response.data
      .filter((record: any) => {
        const clockInLat = record.fieldData[TIME_ENTRY_FIELDS.CLOCK_IN_LAT]
        const clockInLng = record.fieldData[TIME_ENTRY_FIELDS.CLOCK_IN_LNG]
        return clockInLat && clockInLng
      })
      .map((record: any) => {
        const clockInParsed = parseDateFromFileMaker(record.fieldData[TIME_ENTRY_FIELDS.CLOCK_IN])

        // Calculate distance from project (placeholder - would need project coordinates)
        const distanceFromProject = 0 // TODO: Calculate actual distance when project coordinates are available
        const locationVerified = distanceFromProject <= 50 // Within 50 meters

        return {
          id: record.recordId,
          employee_name: record.fieldData[TIME_ENTRY_FIELDS.EMPLOYEE_NAME],
          project_name: record.fieldData[TIME_ENTRY_FIELDS.PROJECT_NAME],
          clock_in: clockInParsed.toISOString(),
          distance_from_project: distanceFromProject,
          location_verified: locationVerified,
          clock_in_lat: Number.parseFloat(record.fieldData[TIME_ENTRY_FIELDS.CLOCK_IN_LAT]) || 0,
          clock_in_lng: Number.parseFloat(record.fieldData[TIME_ENTRY_FIELDS.CLOCK_IN_LNG]) || 0,
          project_lat: 0, // TODO: Get from project data
          project_lng: 0, // TODO: Get from project data
        }
      })

    return reports
  } catch (error) {
    console.error("[v0] Error fetching location compliance reports:", error)
    return []
  }
}

export async function getAutoClockoutStats() {
  try {
    const reports = await getAutoClockoutReports()

    const total = reports.length
    const totalHours = reports.reduce((sum, report) => sum + report.hours_worked, 0)
    const averageHours = total > 0 ? totalHours / total : 0

    return {
      total,
      totalHours,
      averageHours,
    }
  } catch (error) {
    console.error("[v0] Error calculating auto clockout stats:", error)
    return {
      total: 0,
      totalHours: 0,
      averageHours: 0,
    }
  }
}

export async function getLocationComplianceStats() {
  try {
    const reports = await getLocationComplianceReports()

    const total = reports.length
    const verified = reports.filter((r) => r.location_verified).length
    const complianceRate = total > 0 ? (verified / total) * 100 : 0
    const averageDistance = total > 0 ? reports.reduce((sum, r) => sum + r.distance_from_project, 0) / total : 0

    return {
      total,
      verified,
      complianceRate,
      averageDistance,
    }
  } catch (error) {
    console.error("[v0] Error calculating location compliance stats:", error)
    return {
      total: 0,
      verified: 0,
      complianceRate: 0,
      averageDistance: 0,
    }
  }
}
