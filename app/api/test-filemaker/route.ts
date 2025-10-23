import { NextResponse } from "next/server"
import { fileMaker } from "@/lib/filemaker/client"
import { FILEMAKER_LAYOUTS } from "@/lib/filemaker/config"
import { formatDateForFileMaker } from "@/lib/filemaker/utils"

export async function GET() {
  try {
    console.log("[v0] Testing FileMaker connection...")
    console.log("[v0] Server URL:", process.env.FILEMAKER_SERVER_URL)
    console.log("[v0] Database:", process.env.FILEMAKER_DATABASE)
    console.log("[v0] Username:", process.env.FILEMAKER_USERNAME)
    console.log("[v0] Password set:", !!process.env.FILEMAKER_PASSWORD)

    // Test 1: Get employees from STA_Staff
    console.log("[v0] Fetching employees from T17_STAFF layout...")
    const employeesResult = await fileMaker.getRecords("T17_STAFF", 5)
    console.log("[v0] Employees fetched:", employeesResult.response?.data?.length || 0)

    // Test 2: Get projects from PRJ_Projects
    console.log("[v0] Fetching projects from T19_PROJECTS layout...")
    const projectsResult = await fileMaker.getRecords("T19_PROJECTS", 5)
    console.log("[v0] Projects fetched:", projectsResult.response?.data?.length || 0)

    console.log("[v0] Testing write to T17z_TimeEntries layout...")
    const now = new Date()
    const formattedDate = formatDateForFileMaker(now)

    const testTimeEntry = {
      employee_id: "STA001",
      employee_name: "John Smith",
      project_id: "PRJ001",
      project_name: "Test Project",
      clock_in: formattedDate,
      status: "clocked_in",
      notes: "Test entry from API",
    }

    console.log("[v0] Test data to write:", testTimeEntry)
    console.log("[v0] Date format (ISO):", now.toISOString())
    console.log("[v0] Date format (FileMaker):", formattedDate)

    const writeResult = await fileMaker.createRecord(FILEMAKER_LAYOUTS.TIME_ENTRIES, testTimeEntry)

    console.log("[v0] Write result:", writeResult)

    return NextResponse.json({
      success: true,
      message: "FileMaker connection and write test successful!",
      data: {
        employees: {
          count: employeesResult.response?.data?.length || 0,
          sample: employeesResult.response?.data?.[0]?.fieldData || null,
        },
        projects: {
          count: projectsResult.response?.data?.length || 0,
          sample: projectsResult.response?.data?.[0]?.fieldData || null,
        },
        writeTest: {
          success: !!writeResult.response?.recordId,
          recordId: writeResult.response?.recordId,
          data: testTimeEntry,
        },
      },
    })
  } catch (error) {
    console.error("[v0] FileMaker connection error:", error)
    console.error("[v0] Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
