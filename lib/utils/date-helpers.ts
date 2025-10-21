// Helper function to get the start of the current week (Monday)
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Helper function to get the end of the week (Sunday)
export function getWeekEnd(date: Date = new Date()): Date {
  const weekStart = getWeekStart(date)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)
  return weekEnd
}

// Format date range for display
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`
}
