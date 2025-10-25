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

  // Parse the FileMaker format: "10/25/2025 02:36:17 PM" or "10/25/2025 14:36:17"
  const match12hr = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)/i)
  const match24hr = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/)

  let month: string, day: string, year: string, hour24: number, minute: string, second: string

  if (match12hr) {
    // 12-hour format with AM/PM
    const [, m, d, y, h, min, sec, period] = match12hr
    month = m
    day = d
    year = y
    minute = min
    second = sec

    hour24 = Number.parseInt(h)
    if (period.toUpperCase() === "PM" && hour24 !== 12) {
      hour24 += 12
    } else if (period.toUpperCase() === "AM" && hour24 === 12) {
      hour24 = 0
    }
  } else if (match24hr) {
    // 24-hour format
    const [, m, d, y, h, min, sec] = match24hr
    month = m
    day = d
    year = y
    hour24 = Number.parseInt(h)
    minute = min
    second = sec
  } else {
    console.warn("[v0] Unexpected FileMaker date format:", dateStr)
    return new Date(dateStr)
  }

  // Build an ISO string WITHOUT timezone indicator - this represents the ET time
  const isoString = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour24.toString().padStart(2, "0")}:${minute}:${second}`

  // Determine if this date is in DST or EST
  // Create a date object to check DST status for this specific date
  const testDate = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T12:00:00Z`)
  const etString = testDate.toLocaleString("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "short",
  })
  const isDST = etString.includes("EDT")

  // ET offset: EST = UTC-5, EDT = UTC-4
  const etOffsetMinutes = isDST ? -240 : -300 // -4 hours or -5 hours in minutes

  // Create the date by treating the ISO string as if it were in ET
  // We do this by creating a UTC date and then adjusting by the ET offset
  const utcDate = new Date(`${isoString}Z`) // Parse as UTC first
  const correctedDate = new Date(utcDate.getTime() - etOffsetMinutes * 60000) // Subtract ET offset to get actual UTC

  console.log("[v0] Date parsing:", {
    input: dateStr,
    isoString,
    isDST,
    etOffsetMinutes,
    utcDate: utcDate.toISOString(),
    correctedDate: correctedDate.toISOString(),
    localDisplay: correctedDate.toLocaleString("en-US", { timeZone: "America/New_York" }),
  })

  return correctedDate
}
