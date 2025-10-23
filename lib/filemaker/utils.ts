/**
 * Formats a Date object or ISO string to FileMaker's expected format: MM/DD/YYYY HH:MM:SS AM/PM
 * Uses local timezone to match FileMaker's auto-entered timestamp fields
 */
export function formatDateForFileMaker(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date

  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const year = d.getFullYear()

  const hour24 = d.getHours()
  const hour12 = hour24 % 12 || 12
  const ampm = hour24 >= 12 ? "PM" : "AM"
  const hours12 = String(hour12).padStart(2, "0")

  const minutes = String(d.getMinutes()).padStart(2, "0")
  const seconds = String(d.getSeconds()).padStart(2, "0")

  return `${month}/${day}/${year} ${hours12}:${minutes}:${seconds} ${ampm}`
}
