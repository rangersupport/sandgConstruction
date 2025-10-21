# Clock-Out Reminder System Setup

## Overview
The reminder system automatically sends notifications to employees who have been clocked in for more than their configured reminder hours (default: 8 hours).

## Components

### 1. Database Functions
- `get_employees_needing_reminders()` - Identifies employees who need reminders
- Located in: `scripts/005_add_reminders_and_preferences.sql`

### 2. Notification Service
- `lib/services/notification-service.ts` - Handles sending SMS/WhatsApp/Email
- Currently uses mock implementation
- **TODO**: Integrate with real services (Twilio, SendGrid, etc.)

### 3. API Routes
- `/api/reminders/check` - Automated endpoint called by cron job
- `/api/reminders/manual` - Manual trigger for testing (admin only)

### 4. Cron Jobs
- Configured in `vercel.json`
- Runs every 15 minutes
- Checks for employees needing reminders

## Setup Instructions

### Step 1: Run Database Migration
\`\`\`bash
# Execute the SQL script in your Supabase dashboard
# Or use the Supabase CLI:
supabase db push
\`\`\`

### Step 2: Configure Environment Variables
Add to your `.env.local` or Vercel environment variables:

\`\`\`env
# Cron job authentication
CRON_SECRET=your-secure-random-string

# Twilio (for SMS/WhatsApp)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=+1234567890

# SendGrid (for Email)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@sandgconstruction.com
\`\`\`

### Step 3: Enable Vercel Cron Jobs
1. Deploy to Vercel
2. Cron jobs are automatically configured from `vercel.json`
3. Verify in Vercel Dashboard → Project → Cron Jobs

### Step 4: Set Employee Preferences
Employees can configure their reminder preferences:
- Reminder hours (default: 8)
- Auto clock-out delay (default: 30 minutes)
- Notification method (SMS, WhatsApp, Email)
- Contact information

### Step 5: Test the System
\`\`\`bash
# Manual test (requires authentication)
curl -X POST https://your-domain.com/api/reminders/manual \
  -H "Content-Type: application/json"
\`\`\`

## Notification Integration

### Twilio SMS Setup
1. Sign up at https://www.twilio.com
2. Get Account SID and Auth Token
3. Purchase a phone number
4. Add credentials to environment variables
5. Uncomment Twilio code in `notification-service.ts`

### WhatsApp Setup
1. Apply for WhatsApp Business API access through Twilio
2. Get approved WhatsApp number
3. Configure WhatsApp templates
4. Add credentials to environment variables
5. Uncomment WhatsApp code in `notification-service.ts`

### Email Setup (SendGrid)
1. Sign up at https://sendgrid.com
2. Create API key
3. Verify sender email
4. Add credentials to environment variables
5. Uncomment email code in `notification-service.ts`

## Monitoring

### Check Reminder Logs
\`\`\`sql
-- View recent reminders
SELECT 
  cr.*,
  te.clock_in,
  e.name as employee_name,
  p.name as project_name
FROM clock_reminders cr
JOIN time_entries te ON cr.time_entry_id = te.id
JOIN employees e ON te.employee_id = e.id
JOIN projects p ON te.project_id = p.id
ORDER BY cr.created_at DESC
LIMIT 50;
\`\`\`

### Check Pending Reminders
\`\`\`sql
-- Employees currently needing reminders
SELECT * FROM get_employees_needing_reminders();
\`\`\`

## Troubleshooting

### Reminders Not Sending
1. Check cron job is running in Vercel dashboard
2. Verify `CRON_SECRET` matches in environment
3. Check notification service logs
4. Verify employee has valid contact information

### Wrong Timing
1. Check employee preferences table
2. Verify `reminder_hours` setting
3. Check timezone configuration

### Notification Failures
1. Verify API credentials are correct
2. Check phone number format (+1234567890)
3. Review notification service error logs
4. Ensure sufficient API credits/quota

## Cost Estimates

### Twilio SMS
- ~$0.0075 per SMS in US
- 100 employees × 20 days × 10% forget rate = 200 SMS/month
- Cost: ~$1.50/month

### WhatsApp
- ~$0.005 per message
- Same volume: ~$1.00/month

### SendGrid Email
- Free tier: 100 emails/day
- Likely sufficient for most use cases

## Future Enhancements
- [ ] Push notifications for mobile app
- [ ] Customizable message templates
- [ ] Multi-language support
- [ ] Reminder escalation (supervisor notification)
- [ ] Analytics dashboard for reminder effectiveness
