import { NextResponse } from "next/server"
import { processAllReminders } from "@/lib/actions/reminder-actions"

// This endpoint should be called by a cron job every 15 minutes
// Example: Use Vercel Cron Jobs or external service like cron-job.org

export async function GET(request: Request) {
  try {
    console.log("[v0] Running reminder check...")

    const result = await processAllReminders()

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error in reminder check:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Allow POST as well for manual triggers
export async function POST(request: Request) {
  return GET(request)
}
