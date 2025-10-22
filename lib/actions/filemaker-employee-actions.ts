"use server"

import { fileMaker } from "@/lib/filemaker/client"

export async function getAllEmployeesFileMaker() {
  try {
    const result = await fileMaker.getRecords("Employees", 500)

    return {
      success: true,
      employees: result.response.data.map((record: any) => record.fieldData),
    }
  } catch (error) {
    console.error("Get employees error:", error)
    return { success: false, error: "Failed to fetch employees" }
  }
}

export async function clockInFileMaker(employeeId: string) {
  try {
    const now = new Date().toISOString()

    await fileMaker.createRecord("TimeEntries", {
      employee_id: employeeId,
      clock_in: now,
      status: "clocked_in",
    })

    return { success: true }
  } catch (error) {
    console.error("Clock in error:", error)
    return { success: false, error: "Failed to clock in" }
  }
}

export async function clockOutFileMaker(employeeId: string) {
  try {
    const now = new Date().toISOString()

    // Find active time entry for this employee
    const result = await fileMaker.findRecords("TimeEntries", [{ employee_id: employeeId, status: "clocked_in" }])

    if (result.response.data && result.response.data.length > 0) {
      const recordId = result.response.data[0].recordId

      await fileMaker.updateRecord("TimeEntries", recordId, {
        clock_out: now,
        status: "clocked_out",
      })

      return { success: true }
    }

    return { success: false, error: "No active clock-in found" }
  } catch (error) {
    console.error("Clock out error:", error)
    return { success: false, error: "Failed to clock out" }
  }
}
