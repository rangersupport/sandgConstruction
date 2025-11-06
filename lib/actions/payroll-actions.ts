"use server"

import { fileMaker } from "@/lib/filemaker/client"
import { revalidatePath } from "next/cache"
import { FILEMAKER_LAYOUTS, EMPLOYEE_FIELDS, TIME_ENTRY_FIELDS, PAYROLL_HISTORY_FIELDS } from "@/lib/filemaker/config"
import { formatDateForFileMaker, parseDateFromFileMaker } from "@/lib/filemaker/utils"

interface PayrollCalculation {
  employee_id: string
  employee_name: string
  week_start: string
  week_end: string
  regular_hours: number
  overtime_hours: number
  total_hours: number
  hourly_rate: number
  overtime_rate: number
  regular_pay: number
  overtime_pay: number
  total_pay: number
}

export async function calculateWeeklyPayroll(weekStart: Date): Promise<PayrollCalculation[]> {
  try {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    // Get all active employees from FileMaker
    const employeesResult = await fileMaker.findRecords(FILEMAKER_LAYOUTS.EMPLOYEES, [
      { [EMPLOYEE_FIELDS.STATUS]: "Active" },
    ])

    if (!employeesResult.response.data || employeesResult.response.data.length === 0) {
      console.log("[v0] No active employees found")
      return []
    }

    const payrollData: PayrollCalculation[] = []

    for (const empRecord of employeesResult.response.data) {
      const employeeId = empRecord.fieldData[EMPLOYEE_FIELDS.ID]
      const employeeName =
        empRecord.fieldData[EMPLOYEE_FIELDS.NAME_FULL] ||
        `${empRecord.fieldData[EMPLOYEE_FIELDS.NAME_FIRST]} ${empRecord.fieldData[EMPLOYEE_FIELDS.NAME_LAST]}`
      const hourlyRate = Number.parseFloat(empRecord.fieldData[EMPLOYEE_FIELDS.HOURLY_RATE]) || 15.0

      const timeEntriesResult = await fileMaker.findRecords(FILEMAKER_LAYOUTS.TIME_ENTRIES, [
        {
          [TIME_ENTRY_FIELDS.EMPLOYEE_ID]: employeeId,
          [TIME_ENTRY_FIELDS.STATUS]: "clocked_out",
          [TIME_ENTRY_FIELDS.PAYMENT_STATUS]: "unpaid",
        },
      ])

      let totalHours = 0

      if (timeEntriesResult.response.data && timeEntriesResult.response.data.length > 0) {
        for (const entry of timeEntriesResult.response.data) {
          const clockInStr = entry.fieldData[TIME_ENTRY_FIELDS.CLOCK_IN]
          const clockOutStr = entry.fieldData[TIME_ENTRY_FIELDS.CLOCK_OUT]

          if (clockInStr && clockOutStr) {
            const clockIn = parseDateFromFileMaker(clockInStr)
            const clockOut = parseDateFromFileMaker(clockOutStr)

            // Check if entry is within the week range
            if (clockIn >= weekStart && clockIn <= weekEnd) {
              const hours = (clockOut.getTime() - clockIn.getTime()) / 3600000
              totalHours += hours
            }
          }
        }
      }

      if (totalHours > 0) {
        const regularHours = Math.min(totalHours, 40)
        const overtimeHours = Math.max(totalHours - 40, 0)
        const overtimeRate = hourlyRate * 1.5

        const regularPay = regularHours * hourlyRate
        const overtimePay = overtimeHours * overtimeRate
        const totalPay = regularPay + overtimePay

        payrollData.push({
          employee_id: employeeId,
          employee_name: employeeName,
          week_start: weekStart.toISOString(),
          week_end: weekEnd.toISOString(),
          regular_hours: regularHours,
          overtime_hours: overtimeHours,
          total_hours: totalHours,
          hourly_rate: hourlyRate,
          overtime_rate: overtimeRate,
          regular_pay: regularPay,
          overtime_pay: overtimePay,
          total_pay: totalPay,
        })
      }
    }

    return payrollData
  } catch (error) {
    console.error("[v0] Error calculating payroll:", error)
    return []
  }
}

export async function savePayrollToHistory(
  payrollData: PayrollCalculation[],
  payDate: Date,
): Promise<{ success: boolean; error?: string; payrollHistoryIds?: string[] }> {
  try {
    const payrollHistoryIds: string[] = []

    for (const data of payrollData) {
      const fileMakerData = {
        [PAYROLL_HISTORY_FIELDS.EMPLOYEE_ID]: data.employee_id,
        [PAYROLL_HISTORY_FIELDS.EMPLOYEE_NAME]: data.employee_name,
        [PAYROLL_HISTORY_FIELDS.WEEK_START]: formatDateForFileMaker(new Date(data.week_start)),
        [PAYROLL_HISTORY_FIELDS.WEEK_END]: formatDateForFileMaker(new Date(data.week_end)),
        [PAYROLL_HISTORY_FIELDS.REGULAR_HOURS]: data.regular_hours.toString(),
        [PAYROLL_HISTORY_FIELDS.OVERTIME_HOURS]: data.overtime_hours.toString(),
        [PAYROLL_HISTORY_FIELDS.TOTAL_HOURS]: data.total_hours.toString(),
        [PAYROLL_HISTORY_FIELDS.HOURLY_RATE]: data.hourly_rate.toString(),
        [PAYROLL_HISTORY_FIELDS.OVERTIME_RATE]: data.overtime_rate.toString(),
        [PAYROLL_HISTORY_FIELDS.REGULAR_PAY]: data.regular_pay.toString(),
        [PAYROLL_HISTORY_FIELDS.OVERTIME_PAY]: data.overtime_pay.toString(),
        [PAYROLL_HISTORY_FIELDS.TOTAL_PAY]: data.total_pay.toString(),
        [PAYROLL_HISTORY_FIELDS.STATUS]: "paid",
        [PAYROLL_HISTORY_FIELDS.PAY_DATE]: formatDateForFileMaker(payDate),
      }

      const result = await fileMaker.createRecord(FILEMAKER_LAYOUTS.PAYROLL_HISTORY, fileMakerData)
      payrollHistoryIds.push(result.response.recordId)
    }

    return { success: true, payrollHistoryIds }
  } catch (error) {
    console.error("[v0] Error saving payroll history:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to save payroll history" }
  }
}

export async function markTimeEntriesAsPaid(
  employeeId: string,
  weekStart: Date,
  weekEnd: Date,
  payrollHistoryId: string,
): Promise<{ success: boolean; error?: string; updatedCount?: number }> {
  try {
    // Find all unpaid time entries for this employee in the week
    const timeEntriesResult = await fileMaker.findRecords(FILEMAKER_LAYOUTS.TIME_ENTRIES, [
      {
        [TIME_ENTRY_FIELDS.EMPLOYEE_ID]: employeeId,
        [TIME_ENTRY_FIELDS.PAYMENT_STATUS]: "unpaid",
        [TIME_ENTRY_FIELDS.STATUS]: "clocked_out",
      },
    ])

    if (!timeEntriesResult.response.data || timeEntriesResult.response.data.length === 0) {
      return { success: true, updatedCount: 0 }
    }

    let updatedCount = 0

    for (const entry of timeEntriesResult.response.data) {
      const clockInStr = entry.fieldData[TIME_ENTRY_FIELDS.CLOCK_IN]

      if (clockInStr) {
        const clockIn = parseDateFromFileMaker(clockInStr)

        // Check if entry is within the week range
        if (clockIn >= weekStart && clockIn <= weekEnd) {
          const updateData = {
            [TIME_ENTRY_FIELDS.PAYMENT_STATUS]: "paid",
            [TIME_ENTRY_FIELDS.PAYROLL_PERIOD_ID]: payrollHistoryId,
          }

          await fileMaker.updateRecord(FILEMAKER_LAYOUTS.TIME_ENTRIES, entry.recordId, updateData)
          updatedCount++
        }
      }
    }

    revalidatePath("/admin/payroll")
    return { success: true, updatedCount }
  } catch (error) {
    console.error("[v0] Error marking entries as paid:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to mark entries as paid" }
  }
}

export async function getPayrollHistory(weekStart?: Date) {
  try {
    let result

    if (weekStart) {
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      result = await fileMaker.findRecords(FILEMAKER_LAYOUTS.PAYROLL_HISTORY, [
        {
          [PAYROLL_HISTORY_FIELDS.WEEK_START]: `>=${formatDateForFileMaker(weekStart)}`,
        },
      ])
    } else {
      result = await fileMaker.getRecords(FILEMAKER_LAYOUTS.PAYROLL_HISTORY, 100)
    }

    return result.response.data || []
  } catch (error) {
    console.error("[v0] Error fetching payroll history:", error)
    return []
  }
}

export async function getEmployeePaymentHistory(employeeId: string) {
  try {
    const result = await fileMaker.findRecords(FILEMAKER_LAYOUTS.PAYROLL_HISTORY, [
      { [PAYROLL_HISTORY_FIELDS.EMPLOYEE_ID]: employeeId },
    ])

    return result.response.data || []
  } catch (error) {
    console.error("[v0] Error fetching employee payment history:", error)
    return []
  }
}
