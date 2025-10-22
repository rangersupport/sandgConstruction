-- Add status column to time_entries table
ALTER TABLE time_entries 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'clocked_out';

-- Update existing records to set status based on clock_out
UPDATE time_entries 
SET status = CASE 
  WHEN clock_out IS NULL THEN 'clocked_in'
  ELSE 'clocked_out'
END
WHERE status IS NULL;

-- Add index for faster status queries
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_status ON time_entries(employee_id, status);
