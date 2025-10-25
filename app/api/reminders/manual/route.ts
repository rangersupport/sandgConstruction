import { NextResponse } from "next/server"
import { processAllReminders } from "@/lib/actions/reminder-actions"
import { createClient } from "@/lib/supabase/server"

// Manual trigger for testing reminders (admin only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
    }

    // TODO: Add proper authentication check for admin users
    // For now, this is open for testing purposes

    console.log("[v0] Manual reminder trigger initiated")

    const result = await processAllReminders()

    return NextResponse.json({
      success: true,
      message: `Sent ${result.sent} reminders, ${result.failed} failed`,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error in manual reminder trigger:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
