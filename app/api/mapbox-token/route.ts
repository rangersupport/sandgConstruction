import { NextResponse } from "next/server"
import { getMapboxToken } from "@/lib/mapbox/config"

export async function GET() {
  try {
    const token = getMapboxToken()
    return NextResponse.json({ token })
  } catch (error) {
    return NextResponse.json({ error: "Mapbox token not configured" }, { status: 500 })
  }
}
