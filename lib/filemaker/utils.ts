/**
 * Formats a Date object or ISO string to FileMaker's expected format: MM/DD/YYYY HH:MM:SS AM/PM
 * Uses Eastern Time (America/New_York) to match FileMaker's timezone
 */
export function formatDateForFileMaker(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
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
