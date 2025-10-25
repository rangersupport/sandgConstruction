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

  // Create an ISO string and explicitly parse it as Eastern Time
  // We use toLocaleString to convert from ET to local time properly
  const etDateString = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour24.toString().padStart(2, "0")}:${minute}:${second}`

  // Create a date object by parsing the string as if it's in Eastern Time
  // We do this by creating a formatter that outputs in ET, then parsing back
  const tempDate = new Date(etDateString + "Z") // Parse as UTC first

  // Get what this UTC time would be in Eastern Time
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

  // Calculate the offset between ET and UTC for this specific date
  const etParts = etFormatter.formatToParts(tempDate)
  const getValue = (type: string) => etParts.find((p) => p.type === type)?.value || ""

  const etYear = getValue("year")
  const etMonth = getValue("month")
  const etDay = getValue("day")
  const etHour = getValue("hour")
  const etMinute = getValue("minute")
  const etSecond = getValue("second")

  // Now create the actual date by treating our input as ET
  // We need to find what UTC time corresponds to our ET input
  const targetEtString = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour24.toString().padStart(2, "0")}:${minute}:${second}`

  // Use a simpler approach: create date in local time, then adjust
  // Actually, let's use the en-US locale with ET timezone to parse correctly
  const dateInET = new Date(targetEtString)

  // Get the timezone offset for ET (in minutes)
  // ET is UTC-5 (EST) or UTC-4 (EDT)
  // We need to determine if DST is in effect for this date
  const jan = new Date(Number.parseInt(year), 0, 1)
  const jul = new Date(Number.parseInt(year), 6, 1)
  const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset())

  // For Eastern Time: EST is UTC-5 (-300 minutes), EDT is UTC-4 (-240 minutes)
  // But we need to calculate from the perspective of ET, not local time
  // Simpler approach: just add 5 hours (or 4 during DST) to convert ET to UTC

  // Create the date assuming it's in local timezone, then adjust
  const localDate = new Date(
    `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour24.toString().padStart(2, "0")}:${minute}:${second}`,
  )

  // Get local timezone offset
  const localOffset = localDate.getTimezoneOffset() // in minutes, negative for ahead of UTC

  // ET offset (EST = -300, EDT = -240)
  // Determine if DST is in effect for this date in ET
  const testDate = new Date(
    Date.UTC(
      Number.parseInt(year),
      Number.parseInt(month) - 1,
      Number.parseInt(day),
      hour24,
      Number.parseInt(minute),
      Number.parseInt(second),
    ),
  )
  const etTestString = testDate.toLocaleString("en-US", { timeZone: "America/New_York" })
  const isDST = testDate
    .toLocaleString("en-US", { timeZone: "America/New_York", timeZoneName: "short" })
    .includes("EDT")

  const etOffset = isDST ? -240 : -300 // EDT or EST in minutes

  // Adjust: we have a date in local time, but it should be interpreted as ET
  // So we need to shift it by (localOffset - etOffset)
  const offsetDiff = localOffset - etOffset
  const correctedDate = new Date(localDate.getTime() - offsetDiff * 60000)

  console.log("[v0] Date parsing:", {
    input: dateStr,
    parsed: correctedDate.toISOString(),
    localOffset,
    etOffset,
    isDST,
  })

  return correctedDate
}
