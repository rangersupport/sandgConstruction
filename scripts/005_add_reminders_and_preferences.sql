-- Add employee preferences and clock-out reminder system

-- Create employee_preferences table for customizable reminder settings
CREATE TABLE IF NOT EXISTS employee_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE UNIQUE,
  reminder_hours INTEGER DEFAULT 8, -- Hours before sending reminder
  auto_clockout_minutes INTEGER DEFAULT 30, -- Minutes after reminder before auto clock-out
  notification_method TEXT DEFAULT 'sms', -- 'sms', 'whatsapp', 'email', 'push'
  phone_number TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clock_reminders table to track reminder status
CREATE TABLE IF NOT EXISTS clock_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_entry_id UUID REFERENCES time_entries(id) ON DELETE CASCADE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  reminder_acknowledged BOOLEAN DEFAULT false,
  auto_clockout_triggered BOOLEAN DEFAULT false,
  auto_clockout_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add fields to time_entries for auto clock-out tracking
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS is_auto_clocked_out BOOLEAN DEFAULT false;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS distance_from_project DECIMAL(10, 2); -- meters

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employee_preferences_employee ON employee_preferences(employee_id);
CREATE INDEX IF NOT EXISTS idx_clock_reminders_time_entry ON clock_reminders(time_entry_id);
CREATE INDEX IF NOT EXISTS idx_clock_reminders_sent_at ON clock_reminders(reminder_sent_at);
CREATE INDEX IF NOT EXISTS idx_time_entries_reminder_check ON time_entries(clock_in, clock_out, reminder_sent_at) WHERE clock_out IS NULL;

-- Function to get employees needing reminders
CREATE OR REPLACE FUNCTION get_employees_needing_reminders()
RETURNS TABLE (
  time_entry_id UUID,
  employee_id UUID,
  employee_name TEXT,
  employee_phone TEXT,
  employee_email TEXT,
  project_id UUID,
  project_name TEXT,
  clock_in TIMESTAMP WITH TIME ZONE,
  hours_elapsed DECIMAL,
  reminder_hours INTEGER,
  notification_method TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    te.id AS time_entry_id,
    te.employee_id,
    e.name AS employee_name,
    COALESCE(ep.phone_number, e.phone) AS employee_phone,
    COALESCE(ep.email, e.email) AS employee_email,
    te.project_id,
    p.name AS project_name,
    te.clock_in,
    EXTRACT(EPOCH FROM (NOW() - te.clock_in)) / 3600 AS hours_elapsed,
    COALESCE(ep.reminder_hours, 8) AS reminder_hours,
    COALESCE(ep.notification_method, 'sms') AS notification_method
  FROM time_entries te
  JOIN employees e ON te.employee_id = e.id
  JOIN projects p ON te.project_id = p.id
  LEFT JOIN employee_preferences ep ON te.employee_id = ep.employee_id
  WHERE te.clock_out IS NULL
    AND te.reminder_sent_at IS NULL
    AND te.clock_in < NOW() - (COALESCE(ep.reminder_hours, 8) || ' hours')::INTERVAL
    AND e.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Function to get employees needing auto clock-out
CREATE OR REPLACE FUNCTION get_employees_needing_auto_clockout()
RETURNS TABLE (
  time_entry_id UUID,
  employee_id UUID,
  employee_name TEXT,
  project_id UUID,
  project_name TEXT,
  clock_in TIMESTAMP WITH TIME ZONE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  auto_clockout_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    te.id AS time_entry_id,
    te.employee_id,
    e.name AS employee_name,
    te.project_id,
    p.name AS project_name,
    te.clock_in,
    te.reminder_sent_at,
    COALESCE(ep.auto_clockout_minutes, 30) AS auto_clockout_minutes
  FROM time_entries te
  JOIN employees e ON te.employee_id = e.id
  JOIN projects p ON te.project_id = p.id
  LEFT JOIN employee_preferences ep ON te.employee_id = ep.employee_id
  WHERE te.clock_out IS NULL
    AND te.reminder_sent_at IS NOT NULL
    AND te.is_auto_clocked_out = false
    AND te.reminder_sent_at < NOW() - (COALESCE(ep.auto_clockout_minutes, 30) || ' minutes')::INTERVAL
    AND e.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Insert default preferences for existing employees
INSERT INTO employee_preferences (employee_id, reminder_hours, auto_clockout_minutes, notification_method)
SELECT id, 8, 30, 'sms'
FROM employees
WHERE id NOT IN (SELECT employee_id FROM employee_preferences WHERE employee_id IS NOT NULL)
ON CONFLICT (employee_id) DO NOTHING;
