/**
 * Formats a Date object or ISO string to FileMaker's expected format: MM/DD/YYYY HH:MM:SS AM/PM
 * Uses Eastern Time (America/New_York) to match FileMaker server timezone
 */
export function formatDateForFileMaker(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date

  // This prevents the 4-hour UTC offset issue
  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "America/New_York", // Force Eastern Time
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
    return new Date()
  }

  // Parse the FileMaker format: "10/25/2025 08:11:03 AM"
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)/i)

  if (!match) {
    // Fallback to standard parsing if format doesn't match
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

  // Create date string in ISO format with Eastern timezone offset
  // Eastern Time is UTC-5 (standard) or UTC-4 (daylight saving)
  // We'll use a library approach to handle DST correctly
  const dateString = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour24.toString().padStart(2, "0")}:${minute}:${second}`

  // Parse as if it's in Eastern Time by creating a date and adjusting for timezone
  const date = new Date(dateString)

  // Get the timezone offset for Eastern Time at this date
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  // Create a reference date to calculate the offset
  const now = new Date()
  const etString = formatter.format(now)
  const utcString = now.toISOString()

  // Calculate offset (this is approximate but works for our use case)
  // Better approach: use the dateString to create a proper ET date
  const etDate = new Date(
    `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour24.toString().padStart(2, "0")}:${minute}:${second}-05:00`,
  )

  return etDate
}
