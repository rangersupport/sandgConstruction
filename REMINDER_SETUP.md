# Clock-Out Reminder System Setup

## Overview
The reminder system logs notifications for employees who have been clocked in for more than their configured reminder hours (default: 8 hours). This provides the infrastructure for future notification integration.

## Components

### 1. Database Functions
- `get_employees_needing_reminders()` - Identifies employees who need reminders
- `get_employees_needing_auto_clockout()` - Identifies employees who need auto clock-out
- Located in: `scripts/005_add_reminders_and_preferences.sql`

### 2. Notification Service
- `lib/services/notification-service.ts` - Logs notifications to console
- **Future**: Integrate with email service (SendGrid/Resend) when ready

### 3. API Routes
- `/api/reminders/check` - Automated endpoint called by cron job
- `/api/reminders/manual` - Manual trigger for testing (admin only)
- `/api/auto-clockout/check` - Automated auto clock-out endpoint
- `/api/auto-clockout/manual` - Manual auto clock-out trigger

### 4. Cron Jobs
- Configured in `vercel.json`
- Reminder check runs every 15 minutes
- Auto clock-out check runs every 15 minutes

## Setup Instructions

### Step 1: Run Database Migration
Execute the SQL script in your Supabase dashboard or via v0:
- File: `scripts/005_add_reminders_and_preferences.sql`

### Step 2: Configure Environment Variables
Add to your Vercel environment variables:

\`\`\`env
# Cron job authentication
CRON_SECRET=your-secure-random-string
\`\`\`

### Step 3: Enable Vercel Cron Jobs
1. Deploy to Vercel
2. Cron jobs are automatically configured from `vercel.json`
3. Verify in Vercel Dashboard → Project → Cron Jobs

### Step 4: Set Employee Preferences
Employees can configure their reminder preferences:
- Reminder hours (default: 8)
- Auto clock-out delay (default: 30 minutes)
- Email address for future notifications

### Step 5: Test the System
\`\`\`bash
# Manual test (requires authentication)
curl -X POST https://your-domain.com/api/reminders/manual \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
\`\`\`

## Current Behavior

### Reminder Logging
When an employee has been clocked in for more than their configured hours:
1. System identifies them via `get_employees_needing_reminders()`
2. Logs notification details to console
3. Updates `reminder_sent_at` timestamp in database
4. Creates record in `clock_reminders` table

### Auto Clock-Out
30 minutes after reminder is logged:
1. System identifies employees via `get_employees_needing_auto_clockout()`
2. Automatically clocks them out
3. Sets `is_auto_clocked_out` flag to true
4. Logs notification to console

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

### Check Auto Clock-Outs
\`\`\`sql
-- View auto clock-outs
SELECT 
  e.name,
  p.name as project,
  te.clock_in,
  te.clock_out,
  te.hours_worked,
  te.is_auto_clocked_out
FROM time_entries te
JOIN employees e ON te.employee_id = e.id
JOIN projects p ON te.project_id = p.id
WHERE te.is_auto_clocked_out = true
ORDER BY te.clock_out DESC;
\`\`\`

## Future Enhancements

### Email Integration (When Ready)
1. Choose email provider (SendGrid, Resend, etc.)
2. Add API credentials to environment variables
3. Update `notification-service.ts` to send actual emails
4. Test with small group before full rollout

### Additional Features
- Push notifications for mobile app
- Customizable message templates
- Multi-language support
- Reminder escalation (supervisor notification)
- Analytics dashboard for reminder effectiveness

## Troubleshooting

### Reminders Not Logging
1. Check cron job is running in Vercel dashboard
2. Verify `CRON_SECRET` matches in environment
3. Check API route logs in Vercel
4. Verify employee has valid email in preferences

### Wrong Timing
1. Check employee preferences table
2. Verify `reminder_hours` setting
3. Check timezone configuration in database

### Auto Clock-Out Not Working
1. Verify reminder was logged first
2. Check `auto_clockout_minutes` setting
3. Review auto clock-out API logs
4. Ensure employee still has active time entry
