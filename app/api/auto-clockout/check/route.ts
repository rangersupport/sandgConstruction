import { NextResponse } from "next/server"
import { processAllAutoClockouts, sendAdminNotification } from "@/lib/actions/auto-clockout-actions"

// This endpoint should be called by a cron job every 15 minutes
// Configured in vercel.json

export async function GET(request: Request) {
  try {
    // Verify the request is from a trusted source (cron job)
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET || "your-secret-key"

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Running auto clock-out check...")

    const result = await processAllAutoClockouts()

    // Send admin notification if any employees were auto-clocked out
    if (result.processed > 0) {
      await sendAdminNotification(result)
    }

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error in auto clock-out check:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Allow POST as well for manual triggers
export async function POST(request: Request) {
  return GET(request)
}
