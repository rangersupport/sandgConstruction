import { NextResponse } from "next/server"
import { syncEmployeesFromFileMaker } from "@/lib/actions/filemaker-sync-actions"

export async function POST() {
  try {
    console.log("[v0] API: Employee sync requested")

    const result = await syncEmployeesFromFileMaker()

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] API: Employee sync error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to trigger employee sync from FileMaker to Supabase",
  })
}
