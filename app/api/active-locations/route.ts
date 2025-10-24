import { NextResponse } from "next/server"
import { fileMaker } from "@/lib/filemaker/client"
import { FILEMAKER_LAYOUTS, TIME_ENTRY_FIELDS } from "@/lib/filemaker/config"

export async function GET() {
  try {
    const result = await fileMaker.findRecords(FILEMAKER_LAYOUTS.TIME_ENTRIES, [
      { [TIME_ENTRY_FIELDS.STATUS]: "clocked_in" },
    ])

    if (!result.response.data) {
      return NextResponse.json([])
    }

    const locations = result.response.data
      .map((record: any) => {
        const lat = Number.parseFloat(record.fieldData[TIME_ENTRY_FIELDS.CLOCK_IN_LAT])
        const lng = Number.parseFloat(record.fieldData[TIME_ENTRY_FIELDS.CLOCK_IN_LNG])

        if (isNaN(lat) || isNaN(lng)) {
          return null
        }

        return {
          id: record.recordId,
          employee_id: record.fieldData[TIME_ENTRY_FIELDS.EMPLOYEE_ID],
          employee_name: record.fieldData[TIME_ENTRY_FIELDS.EMPLOYEE_NAME],
          project_id: record.fieldData[TIME_ENTRY_FIELDS.PROJECT_ID],
          project_name: record.fieldData[TIME_ENTRY_FIELDS.PROJECT_NAME],
          clock_in: record.fieldData[TIME_ENTRY_FIELDS.CLOCK_IN],
          latitude: lat,
          longitude: lng,
          location: record.fieldData[TIME_ENTRY_FIELDS.CLOCK_IN_LOCATION],
        }
      })
      .filter((loc: any) => loc !== null)

    return NextResponse.json(locations)
  } catch (error) {
    console.error("[v0] Error fetching active locations:", error)
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
  }
}
