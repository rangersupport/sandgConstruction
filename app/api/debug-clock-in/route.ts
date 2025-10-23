import { type NextRequest, NextResponse } from "next/server"
import { TIME_ENTRY_FIELDS } from "@/lib/filemaker/config"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, projectId, location } = body

    // This is what the WORKING test endpoint sends
    const testEndpointData = {
      [TIME_ENTRY_FIELDS.EMPLOYEE_ID]: "STA001",
      [TIME_ENTRY_FIELDS.EMPLOYEE_NAME]: "John Smith",
      [TIME_ENTRY_FIELDS.PROJECT_ID]: "PRJ001",
      [TIME_ENTRY_FIELDS.PROJECT_NAME]: "Test Project",
      [TIME_ENTRY_FIELDS.CLOCK_IN]: new Date().toISOString(),
      [TIME_ENTRY_FIELDS.STATUS]: "clocked_in",
      [TIME_ENTRY_FIELDS.NOTES]: "Test entry from API",
    }

    // This is what the actual clock-in would send
    const actualClockInData = {
      [TIME_ENTRY_FIELDS.EMPLOYEE_ID]: employeeId || "MISSING",
      [TIME_ENTRY_FIELDS.EMPLOYEE_NAME]: "Would fetch from DB",
      [TIME_ENTRY_FIELDS.PROJECT_ID]: projectId || "MISSING",
      [TIME_ENTRY_FIELDS.PROJECT_NAME]: "Would fetch from DB",
      [TIME_ENTRY_FIELDS.CLOCK_IN]: new Date().toISOString(),
      [TIME_ENTRY_FIELDS.STATUS]: "clocked_in",
      [TIME_ENTRY_FIELDS.NOTES]: `Clocked in via mobile app at ${new Date().toLocaleString()}`,
      ...(location?.latitude && location?.longitude
        ? {
            [TIME_ENTRY_FIELDS.CLOCK_IN_LOCATION]: `Location: ${location.latitude}, ${location.longitude} (±${location.accuracy}m)`,
            [TIME_ENTRY_FIELDS.CLOCK_IN_LAT]: location.latitude,
            [TIME_ENTRY_FIELDS.CLOCK_IN_LNG]: location.longitude,
          }
        : {}),
    }

    // Compare the two
    const testKeys = Object.keys(testEndpointData).sort()
    const actualKeys = Object.keys(actualClockInData).sort()

    const missingInActual = testKeys.filter((key) => !actualKeys.includes(key))
    const extraInActual = actualKeys.filter((key) => !testKeys.includes(key))

    return NextResponse.json({
      success: true,
      comparison: {
        testEndpointData,
        actualClockInData,
        testKeys,
        actualKeys,
        missingInActual,
        extraInActual,
        analysis: {
          message:
            missingInActual.length > 0
              ? `Actual clock-in is MISSING these fields that test has: ${missingInActual.join(", ")}`
              : "Actual clock-in has all the same fields as test endpoint",
          fieldCount: {
            test: testKeys.length,
            actual: actualKeys.length,
          },
        },
      },
    })
  } catch (error) {
    console.error("[v0] Debug endpoint error:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
