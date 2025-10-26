import { NextResponse } from "next/server"
import { fileMaker } from "@/lib/filemaker/client"
import { FILEMAKER_LAYOUTS, EMPLOYEE_FIELDS } from "@/lib/filemaker/config"

export async function GET() {
  try {
    console.log("[v0] Diagnostic: Fetching all staff records...")

    // Get all staff records
    const allStaff = await fileMaker.getRecords(FILEMAKER_LAYOUTS.EMPLOYEES, { _limit: 100 })

    const staffData = allStaff.response.data?.map((record) => ({
      recordId: record.recordId,
      id: record.fieldData[EMPLOYEE_FIELDS.ID],
      name: record.fieldData[EMPLOYEE_FIELDS.NAME_FULL],
      email: record.fieldData[EMPLOYEE_FIELDS.EMAIL],
      emailRaw: JSON.stringify(record.fieldData[EMPLOYEE_FIELDS.EMAIL]),
      pinHash: record.fieldData[EMPLOYEE_FIELDS.PIN_HASH],
      webAdminRole: record.fieldData[EMPLOYEE_FIELDS.WEB_ADMIN_ROLE],
      loginNumber: record.fieldData[EMPLOYEE_FIELDS.EMPLOYEE_LOGIN_NUMBER],
    }))

    // Try to find David specifically
    console.log("[v0] Diagnostic: Searching for david@sandgservice.com...")
    let davidRecord = null
    try {
      const davidResult = await fileMaker.findRecords(FILEMAKER_LAYOUTS.EMPLOYEES, [
        { [EMPLOYEE_FIELDS.EMAIL]: "david@sandgservice.com" },
      ])
      davidRecord = davidResult.response.data?.[0]
    } catch (e) {
      console.log("[v0] Diagnostic: Could not find David by email search")
    }

    return NextResponse.json({
      success: true,
      totalRecords: allStaff.response.dataInfo?.foundCount,
      layout: FILEMAKER_LAYOUTS.EMPLOYEES,
      emailFieldName: EMPLOYEE_FIELDS.EMAIL,
      staffData,
      davidRecord: davidRecord
        ? {
            found: true,
            data: davidRecord.fieldData,
          }
        : {
            found: false,
          },
    })
  } catch (error) {
    console.error("[v0] Diagnostic error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
