import { NextResponse } from "next/server"
import { processAllAutoClockouts, sendAdminNotification } from "@/lib/actions/auto-clockout-actions"

// Manual trigger for testing auto clock-out (admin only)
export async function POST(request: Request) {
  try {
    // TODO: Add proper authentication check for admin users

    console.log("[v0] Manual auto clock-out trigger initiated")

    const result = await processAllAutoClockouts()

    // Send admin notification
    if (result.processed > 0) {
      await sendAdminNotification(result)
    }

    return NextResponse.json({
      success: true,
      message: `Auto clocked out ${result.processed} employees, ${result.failed} failed`,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error in manual auto clock-out trigger:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
