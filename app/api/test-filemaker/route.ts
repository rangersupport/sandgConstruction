import { NextResponse } from "next/server"
import { fileMaker } from "@/lib/filemaker/client"

export async function GET() {
  try {
    console.log("[v0] Testing FileMaker connection...")
    console.log("[v0] Server URL:", process.env.FILEMAKER_SERVER_URL)
    console.log("[v0] Database:", process.env.FILEMAKER_DATABASE)
    console.log("[v0] Username:", process.env.FILEMAKER_USERNAME)

    // Test 1: Get employees from STA_Staff
    console.log("[v0] Fetching employees from L1220_STAFF_List_Entry layout...")
    const employeesResult = await fileMaker.getRecords("L1220_STAFF_List_Entry", 5)
    console.log("[v0] Employees fetched:", employeesResult.response?.data?.length || 0)

    // Test 2: Get projects from PRJ_Projects
    console.log("[v0] Fetching projects from PRJ_Projects layout...")
    const projectsResult = await fileMaker.getRecords("PRJ_Projects", 5)
    console.log("[v0] Projects fetched:", projectsResult.response?.data?.length || 0)

    return NextResponse.json({
      success: true,
      message: "FileMaker connection successful!",
      data: {
        employees: {
          count: employeesResult.response?.data?.length || 0,
          sample: employeesResult.response?.data?.[0]?.fieldData || null,
        },
        projects: {
          count: projectsResult.response?.data?.length || 0,
          sample: projectsResult.response?.data?.[0]?.fieldData || null,
        },
      },
    })
  } catch (error) {
    console.error("[v0] FileMaker connection error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error,
      },
      { status: 500 },
    )
  }
}
