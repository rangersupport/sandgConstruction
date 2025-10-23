// Notification service for sending reminders via SMS and Email
// Note: This is a placeholder implementation. In production, integrate with:
// - Twilio for SMS
// - SendGrid/Resend for Email

export interface NotificationPayload {
  to: string // email address
  message: string
  subject?: string
  method?: "sms" | "email"
}

export interface NotificationResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendNotification(payload: NotificationPayload): Promise<NotificationResult> {
  console.log("[v0] Notification logged:", {
    to: payload.to,
    subject: payload.subject || "Clock-Out Reminder",
    message: payload.message,
    timestamp: new Date().toISOString(),
  })

  // For now, just log the notification
  // TODO: Integrate with email service (SendGrid/Resend) when ready
  return {
    success: true,
    messageId: `logged-${Date.now()}`,
  }
}

export function formatReminderMessage(employeeName: string, projectName: string, hoursElapsed: number): string {
  return `Clock-Out Reminder

Hi ${employeeName},

You've been clocked in for ${hoursElapsed.toFixed(1)} hours at ${projectName}.

Please clock out now if you've finished work.

If you don't clock out in 30 minutes, you'll be automatically clocked out.

- S&G Construction`
}

export function formatAutoClockoutMessage(employeeName: string, projectName: string, totalHours: number): string {
  return `Auto Clock-Out Notice

Hi ${employeeName},

You were automatically clocked out at ${new Date().toLocaleTimeString()} from ${projectName}.

Total hours: ${totalHours.toFixed(2)}

Please contact your supervisor if this is incorrect.

- S&G Construction`
}
