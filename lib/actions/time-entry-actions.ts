"use server"

import { fileMaker } from "@/lib/filemaker/client"
import { revalidatePath } from "next/cache"
import type { EmployeeStatus } from "@/lib/types/database"
import { FILEMAKER_LAYOUTS, TIME_ENTRY_FIELDS, PROJECT_FIELDS } from "@/lib/filemaker/config"
import { formatDateForFileMaker } from "@/lib/filemaker/utils"
import { getEmployeeById } from "@/lib/employees/utils"

interface ClockInData {
  employeeId: string
  projectId: string
  latitude: number
  longitude: number
  accuracy: number
}

interface ClockOutData {
  timeEntryId: string
  latitude: number
  longitude: number
  accuracy: number
}

async function getProjectById(projectId: string) {
  try {
    const result = await fileMaker.findRecords(FILEMAKER_LAYOUTS.PROJECTS, [{ [PROJECT_FIELDS.ID]: projectId }])

    if (result.response.data && result.response.data.length > 0) {
      return {
        id: result.response.data[0].fieldData[PROJECT_FIELDS.ID],
        name: result.response.data[0].fieldData[PROJECT_FIELDS.NAME],
      }
    }
    return null
  } catch (error) {
    console.error("[v0] Error fetching project:", error)
    return null
  }
}

export async function getEmployeeStatus(employeeId: string): Promise<EmployeeStatus | null> {
  try {
    const result = await fileMaker.findRecords(FILEMAKER_LAYOUTS.TIME_ENTRIES, [
      {
        [TIME_ENTRY_FIELDS.EMPLOYEE_ID]: employeeId,
        [TIME_ENTRY_FIELDS.STATUS]: "clocked_in",
      },
    ])

    if (!result.response.data || result.response.data.length === 0) {
      return {
        is_clocked_in: false,
        time_entry_id: null,
        project_id: null,
        project_name: null,
        clock_in: null,
        hours_elapsed: null,
      }
    }

    const record = result.response.data[0]
    const clockInStr = record.fieldData[TIME_ENTRY_FIELDS.CLOCK_IN]
    const clockInDate = new Date(clockInStr)
    const hoursElapsed = (Date.now() - clockInDate.getTime()) / 3600000

    return {
      is_clocked_in: true,
      time_entry_id: record.recordId,
      project_id: record.fieldData[TIME_ENTRY_FIELDS.PROJECT_ID],
      project_name: record.fieldData[TIME_ENTRY_FIELDS.PROJECT_NAME],
      clock_in: clockInDate.toISOString(),
      hours_elapsed: hoursElapsed,
    }
  } catch (error) {
    console.error("[v0] Error fetching employee status:", error)
    return null
  }
}

export async function clockIn(data: ClockInData): Promise<{ success: boolean; error?: string; timeEntry?: any }> {
  const status = await getEmployeeStatus(data.employeeId)
  if (status?.is_clocked_in) {
    const clockInTime = new Date(status.clock_in!).toLocaleString()
    return {
      success: false,
      error: `You are already clocked in at ${status.project_name} since ${clockInTime}. Please clock out before clocking in again.`,
    }
  }

  const clockInTime = new Date()
  const clockInTimeFormatted = formatDateForFileMaker(clockInTime)

  const employee = await getEmployeeById(data.employeeId)
  const project = await getProjectById(data.projectId)

  const fileMakerData = {
    [TIME_ENTRY_FIELDS.EMPLOYEE_ID]: data.employeeId,
    [TIME_ENTRY_FIELDS.EMPLOYEE_NAME]: employee?.name || "Unknown Employee",
    [TIME_ENTRY_FIELDS.PROJECT_ID]: data.projectId,
    [TIME_ENTRY_FIELDS.PROJECT_NAME]: project?.name || "Unknown Project",
    [TIME_ENTRY_FIELDS.CLOCK_IN]: clockInTimeFormatted,
    [TIME_ENTRY_FIELDS.CLOCK_IN_LAT]: data.latitude,
    [TIME_ENTRY_FIELDS.CLOCK_IN_LNG]: data.longitude,
    [TIME_ENTRY_FIELDS.CLOCK_IN_LOCATION]: `${data.latitude}, ${data.longitude}`,
    [TIME_ENTRY_FIELDS.STATUS]: "clocked_in",
    [TIME_ENTRY_FIELDS.NOTES]: `Clocked in via web app. GPS accuracy: ±${data.accuracy.toFixed(0)}m`,
  }

  console.log("[v0] Clock-in FileMaker data:", JSON.stringify(fileMakerData, null, 2))

  try {
    const fileMakerResult = await fileMaker.createRecord(FILEMAKER_LAYOUTS.TIME_ENTRIES, fileMakerData)
    console.log("[v0] FileMaker clock in successful:", JSON.stringify(fileMakerResult, null, 2))

    revalidatePath("/employee")
    revalidatePath("/dashboard")

    return {
      success: true,
      timeEntry: {
        id: fileMakerResult.response.recordId,
        employee_id: data.employeeId,
        project_id: data.projectId,
        clock_in: clockInTime.toISOString(),
      },
    }
  } catch (error) {
    console.error("[v0] FileMaker clock in failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clock in",
    }
  }
}

export async function clockOut(data: ClockOutData): Promise<{ success: boolean; error?: string; timeEntry?: any }> {
  const clockOutTime = new Date()
  const clockOutTimeFormatted = formatDateForFileMaker(clockOutTime)

  try {
    const updateData = {
      [TIME_ENTRY_FIELDS.CLOCK_OUT]: clockOutTimeFormatted,
      [TIME_ENTRY_FIELDS.CLOCK_OUT_LAT]: data.latitude,
      [TIME_ENTRY_FIELDS.CLOCK_OUT_LNG]: data.longitude,
      [TIME_ENTRY_FIELDS.CLOCK_OUT_LOCATION]: `${data.latitude}, ${data.longitude}`,
      [TIME_ENTRY_FIELDS.STATUS]: "clocked_out",
    }

    console.log("[v0] Updating FileMaker record", data.timeEntryId, "with data:", JSON.stringify(updateData, null, 2))

    const updateResult = await fileMaker.updateRecord(FILEMAKER_LAYOUTS.TIME_ENTRIES, data.timeEntryId, updateData)

    console.log("[v0] FileMaker clock out successful:", JSON.stringify(updateResult, null, 2))

    revalidatePath("/employee")
    revalidatePath("/dashboard")

    return {
      success: true,
      timeEntry: {
        id: data.timeEntryId,
        clock_out: clockOutTime.toISOString(),
      },
    }
  } catch (error) {
    console.error("[v0] FileMaker clock out failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clock out",
    }
  }
}

export async function getActiveProjects() {
  try {
    const result = await fileMaker.findRecords(FILEMAKER_LAYOUTS.PROJECTS, [{ [PROJECT_FIELDS.STATUS]: "Active" }])

    if (!result.response.data) {
      return []
    }

    return result.response.data.map((record: any) => ({
      id: record.fieldData[PROJECT_FIELDS.ID],
      name: record.fieldData[PROJECT_FIELDS.NAME],
      status: record.fieldData[PROJECT_FIELDS.STATUS],
    }))
  } catch (error) {
    console.error("[v0] Error fetching projects:", error)
    return []
  }
}

export async function getTodayHours(employeeId: string): Promise<number> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayFormatted = formatDateForFileMaker(today)

    const result = await fileMaker.findRecords(FILEMAKER_LAYOUTS.TIME_ENTRIES, [
      {
        [TIME_ENTRY_FIELDS.EMPLOYEE_ID]: employeeId,
        [TIME_ENTRY_FIELDS.CLOCK_IN]: `>=${todayFormatted}`,
      },
    ])

    if (!result.response.data) {
      return 0
    }

    let totalHours = 0
    for (const record of result.response.data) {
      const clockIn = new Date(record.fieldData[TIME_ENTRY_FIELDS.CLOCK_IN])
      const clockOut = record.fieldData[TIME_ENTRY_FIELDS.CLOCK_OUT]
        ? new Date(record.fieldData[TIME_ENTRY_FIELDS.CLOCK_OUT])
        : new Date()

      const hours = (clockOut.getTime() - clockIn.getTime()) / 3600000
      totalHours += hours
    }

    return totalHours
  } catch (error) {
    console.error("[v0] Error fetching today hours:", error)
    return 0
  }
}

export async function getActiveTimeEntries() {
  try {
    const result = await fileMaker.findRecords(FILEMAKER_LAYOUTS.TIME_ENTRIES, [
      { [TIME_ENTRY_FIELDS.STATUS]: "clocked_in" },
    ])

    if (!result.response.data) {
      return []
    }

    return result.response.data.map((record: any) => ({
      id: record.recordId,
      employee_id: record.fieldData[TIME_ENTRY_FIELDS.EMPLOYEE_ID],
      employee_name: record.fieldData[TIME_ENTRY_FIELDS.EMPLOYEE_NAME],
      project_id: record.fieldData[TIME_ENTRY_FIELDS.PROJECT_ID],
      project_name: record.fieldData[TIME_ENTRY_FIELDS.PROJECT_NAME],
      clock_in: record.fieldData[TIME_ENTRY_FIELDS.CLOCK_IN],
      status: record.fieldData[TIME_ENTRY_FIELDS.STATUS],
    }))
  } catch (error) {
    console.error("[v0] Error fetching active time entries:", error)
    return []
  }
}
