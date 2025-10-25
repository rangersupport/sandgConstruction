/**
 * Formats a Date object or ISO string to FileMaker's expected format: MM/DD/YYYY HH:MM:SS AM/PM
 * Uses Eastern Time (America/New_York) to match FileMaker server timezone
 */
export function formatDateForFileMaker(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date

  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  })

  const parts = formatter.formatToParts(d)
  const getValue = (type: string) => parts.find((p) => p.type === type)?.value || ""

  const month = getValue("month")
  const day = getValue("day")
  const year = getValue("year")
  const hour = getValue("hour")
  const minute = getValue("minute")
  const second = getValue("second")
  const dayPeriod = getValue("dayPeriod")

  return `${month}/${day}/${year} ${hour}:${minute}:${second} ${dayPeriod}`
}

/**
 * Parses a FileMaker date string (MM/DD/YYYY HH:MM:SS AM/PM) back to a Date object
 * Assumes the FileMaker date is in Eastern Time (America/New_York)
 */
export function parseDateFromFileMaker(dateStr: string): Date {
  if (!dateStr) {
    console.warn("[v0] Empty date string provided to parseDateFromFileMaker")
    return new Date()
  }

  // Parse the FileMaker format: "10/25/2025 10:02:17 AM"
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)/i)

  if (!match) {
    console.warn("[v0] Unexpected FileMaker date format:", dateStr)
    return new Date(dateStr)
  }

  const [, month, day, year, hour, minute, second, period] = match

  // Convert to 24-hour format
  let hour24 = Number.parseInt(hour)
  if (period.toUpperCase() === "PM" && hour24 !== 12) {
    hour24 += 12
  } else if (period.toUpperCase() === "AM" && hour24 === 12) {
    hour24 = 0
  }

  // Create ISO string in local time, then parse it
  // FileMaker stores in ET, so we need to create a date that represents that ET time
  const isoString = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour24.toString().padStart(2, "0")}:${minute}:${second}`

  // Parse as local time first
  const localDate = new Date(isoString)

  // Now we need to adjust for the timezone difference
  // Get what this time would be in ET
  const etFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  // Create a test date to determine ET offset
  const testDate = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T12:00:00Z`)
  const etString = testDate.toLocaleString("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "short",
  })
  const isDST = etString.includes("EDT")

  // ET offset: EST = UTC-5, EDT = UTC-4
  const etOffsetHours = isDST ? -4 : -5

  // Get local timezone offset in hours
  const localOffsetMinutes = localDate.getTimezoneOffset()
  const localOffsetHours = -localOffsetMinutes / 60

  // Calculate the difference and adjust
  const offsetDiff = etOffsetHours - localOffsetHours
  const correctedDate = new Date(localDate.getTime() + offsetDiff * 3600000)

  console.log("[v0] Date parsing:", {
    input: dateStr,
    localDate: localDate.toISOString(),
    correctedDate: correctedDate.toISOString(),
    etOffsetHours,
    localOffsetHours,
    isDST,
  })

  return correctedDate
}
