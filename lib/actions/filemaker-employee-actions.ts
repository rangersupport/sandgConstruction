"use server"

import { fileMaker } from "@/lib/filemaker/client"
import { FILEMAKER_LAYOUTS, EMPLOYEE_FIELDS } from "@/lib/filemaker/config"

export async function getAllEmployeesFileMaker() {
  try {
    const result = await fileMaker.getRecords(FILEMAKER_LAYOUTS.EMPLOYEES, 500)

    return {
      success: true,
      employees: result.response.data.map((record: any) => ({
        id: record.fieldData[EMPLOYEE_FIELDS.ID],
        employee_number: record.fieldData[EMPLOYEE_FIELDS.EMPLOYEE_NUMBER],
        name: record.fieldData[EMPLOYEE_FIELDS.NAME_FULL],
        first_name: record.fieldData[EMPLOYEE_FIELDS.NAME_FIRST],
        last_name: record.fieldData[EMPLOYEE_FIELDS.NAME_LAST],
        phone: record.fieldData[EMPLOYEE_FIELDS.PHONE1],
        cell: record.fieldData[EMPLOYEE_FIELDS.CELL],
        email: record.fieldData[EMPLOYEE_FIELDS.EMAIL],
        role: record.fieldData[EMPLOYEE_FIELDS.CATEGORY],
        department: record.fieldData[EMPLOYEE_FIELDS.DEPARTMENT],
        hourly_wage: record.fieldData[EMPLOYEE_FIELDS.HOURLY_RATE],
        status: record.fieldData[EMPLOYEE_FIELDS.STATUS],
        title: record.fieldData[EMPLOYEE_FIELDS.TITLE],
      })),
    }
  } catch (error) {
    console.error("[v0] Get employees from FileMaker error:", error)
    return { success: false, error: "Failed to fetch employees from FileMaker" }
  }
}

export async function authenticateEmployeeFileMaker(employeeNumber: string, pin: string) {
  try {
    const result = await fileMaker.findRecords(FILEMAKER_LAYOUTS.EMPLOYEES, [
      { [EMPLOYEE_FIELDS.EMPLOYEE_NUMBER]: employeeNumber },
    ])

    if (!result.response.data || result.response.data.length === 0) {
      return { success: false, error: "Employee not found" }
    }

    const employee = result.response.data[0].fieldData

    // TODO: Implement PIN verification with bcrypt
    // For now, compare plain text (you should hash PINs in FileMaker)
    const storedPin = employee[EMPLOYEE_FIELDS.PIN_HASH]

    if (storedPin !== pin) {
      return { success: false, error: "Invalid PIN" }
    }

    return {
      success: true,
      employee: {
        id: employee[EMPLOYEE_FIELDS.ID],
        employee_number: employee[EMPLOYEE_FIELDS.EMPLOYEE_NUMBER],
        name: employee[EMPLOYEE_FIELDS.NAME_FULL],
        role: employee[EMPLOYEE_FIELDS.CATEGORY],
      },
    }
  } catch (error) {
    console.error("[v0] Employee authentication error:", error)
    return { success: false, error: "Authentication failed" }
  }
}

export async function clockInFileMaker(employeeId: string, location?: { lat: number; lng: number }) {
  try {
    const now = new Date().toISOString()

    await fileMaker.createRecord(FILEMAKER_LAYOUTS.TIME_ENTRIES, {
      employee_id: employeeId,
      clock_in: now,
      clock_in_lat: location?.lat || null,
      clock_in_lng: location?.lng || null,
      status: "clocked_in",
    })

    return { success: true }
  } catch (error) {
    console.error("[v0] Clock in to FileMaker error:", error)
    return { success: false, error: "Failed to clock in to FileMaker" }
  }
}

export async function clockOutFileMaker(employeeId: string, location?: { lat: number; lng: number }) {
  try {
    const now = new Date().toISOString()

    // Find active time entry for this employee
    const result = await fileMaker.findRecords(FILEMAKER_LAYOUTS.TIME_ENTRIES, [
      { employee_id: employeeId, status: "clocked_in" },
    ])

    if (result.response.data && result.response.data.length > 0) {
      const recordId = result.response.data[0].recordId

      await fileMaker.updateRecord(FILEMAKER_LAYOUTS.TIME_ENTRIES, recordId, {
        clock_out: now,
        clock_out_lat: location?.lat || null,
        clock_out_lng: location?.lng || null,
        status: "clocked_out",
      })

      return { success: true }
    }

    return { success: false, error: "No active clock-in found" }
  } catch (error) {
    console.error("[v0] Clock out to FileMaker error:", error)
    return { success: false, error: "Failed to clock out to FileMaker" }
  }
}
