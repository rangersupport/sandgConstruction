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
 * Parses a FileMaker date string back to a Date object
 * FileMaker dates are ALWAYS in Eastern Time (America/New_York)
 *
 * Supported formats:
 * - "10/25/2025 02:36:17 PM" (12-hour with AM/PM)
 * - "10/25/2025 14:36:17" (24-hour)
 */
export function parseDateFromFileMaker(dateStr: string): Date {
  if (!dateStr) {
    console.warn("[v0] Empty date string provided to parseDateFromFileMaker")
    return new Date()
  }

  // Parse the FileMaker format: "10/25/2025 02:36:17 PM" or "10/25/2025 14:36:17"
  const match12hr = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)/i)
  const match24hr = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/)

  let month: string, day: string, year: string, hour24: number, minute: string, second: string

  if (match12hr) {
    // 12-hour format with AM/PM
    const [, m, d, y, h, min, sec, period] = match12hr
    month = m.padStart(2, "0")
    day = d.padStart(2, "0")
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
    month = m.padStart(2, "0")
    day = d.padStart(2, "0")
    year = y
    hour24 = Number.parseInt(h)
    minute = min
    second = sec
  } else {
    console.warn("[v0] Unexpected FileMaker date format:", dateStr)
    // Fallback: try to parse as-is
    return new Date(dateStr)
  }

  // Create a date string in a format that JavaScript can parse unambiguously
  // We'll use the format: "YYYY-MM-DDTHH:mm:ss" and then manually adjust for ET
  const hour24Str = hour24.toString().padStart(2, "0")
  const localDateStr = `${year}-${month}-${day}T${hour24Str}:${minute}:${second}`

  // Parse this as if it were in the local timezone, then get the UTC timestamp
  const tempDate = new Date(localDateStr)

  // Now we need to figure out what the UTC time should be
  // The FileMaker time is in ET. We need to convert ET to UTC.
  // To do this, we create a date in ET and get its UTC equivalent

  // Use Intl.DateTimeFormat to determine the ET offset for this specific date
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

  // Create a UTC date for this calendar date/time
  const utcDate = new Date(
    Date.UTC(
      Number.parseInt(year),
      Number.parseInt(month) - 1,
      Number.parseInt(day),
      hour24,
      Number.parseInt(minute),
      Number.parseInt(second),
    ),
  )

  // Get what this UTC time looks like in ET
  const etString = etFormatter.format(utcDate)
  const etMatch = etString.match(/(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2}):(\d{2}):(\d{2})/)

  if (!etMatch) {
    console.error("[v0] Failed to parse ET string:", etString)
    return utcDate
  }

  const [, etMonth, etDay, etYear, etHour, etMinute, etSecond] = etMatch

  // Calculate the difference between what we want (the input) and what we got (ET representation)
  const wantedMinutes = hour24 * 60 + Number.parseInt(minute)
  const gotMinutes = Number.parseInt(etHour) * 60 + Number.parseInt(etMinute)
  const diffMinutes = wantedMinutes - gotMinutes

  // Adjust the UTC date by this difference
  const correctedDate = new Date(utcDate.getTime() + diffMinutes * 60 * 1000)

  console.log("[v0] Date parsing:", {
    input: dateStr,
    parsed: {
      year,
      month,
      day,
      hour24,
      minute,
      second,
    },
    utcDate: utcDate.toISOString(),
    etRepresentation: etString,
    diffMinutes,
    correctedUTC: correctedDate.toISOString(),
    displayET: correctedDate.toLocaleString("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
  })

  return correctedDate
}
