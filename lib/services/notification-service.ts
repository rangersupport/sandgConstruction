// Notification service for sending reminders via SMS/WhatsApp
// Note: This is a placeholder implementation. In production, integrate with:
// - Twilio for SMS
// - WhatsApp Business API for WhatsApp
// - SendGrid/Resend for Email

export interface NotificationPayload {
  to: string // phone number or email
  message: string
  method: "sms" | "whatsapp" | "email"
}

export interface NotificationResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendNotification(payload: NotificationPayload): Promise<NotificationResult> {
  console.log("[v0] Sending notification:", payload)

  // TODO: Implement actual notification sending
  // For now, this is a mock implementation that logs the notification

  try {
    switch (payload.method) {
      case "sms":
        return await sendSMS(payload.to, payload.message)
      case "whatsapp":
        return await sendWhatsApp(payload.to, payload.message)
      case "email":
        return await sendEmail(payload.to, payload.message)
      default:
        return {
          success: false,
          error: "Unsupported notification method",
        }
    }
  } catch (error) {
    console.error("[v0] Notification error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

async function sendSMS(phoneNumber: string, message: string): Promise<NotificationResult> {
  // TODO: Integrate with Twilio
  // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // const result = await twilio.messages.create({
  //   body: message,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: phoneNumber
  // });

  console.log(`[v0] SMS to ${phoneNumber}: ${message}`)

  return {
    success: true,
    messageId: `mock-sms-${Date.now()}`,
  }
}

async function sendWhatsApp(phoneNumber: string, message: string): Promise<NotificationResult> {
  // TODO: Integrate with WhatsApp Business API
  // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // const result = await twilio.messages.create({
  //   body: message,
  //   from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
  //   to: `whatsapp:${phoneNumber}`
  // });

  console.log(`[v0] WhatsApp to ${phoneNumber}: ${message}`)

  return {
    success: true,
    messageId: `mock-whatsapp-${Date.now()}`,
  }
}

async function sendEmail(email: string, message: string): Promise<NotificationResult> {
  // TODO: Integrate with SendGrid or Resend
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // const result = await sgMail.send({
  //   to: email,
  //   from: process.env.FROM_EMAIL,
  //   subject: 'Clock-Out Reminder',
  //   text: message
  // });

  console.log(`[v0] Email to ${email}: ${message}`)

  return {
    success: true,
    messageId: `mock-email-${Date.now()}`,
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
