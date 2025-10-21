-- Removed hours_worked column references and status column references that don't exist in schema
-- Function to calculate hours worked (returns value instead of updating non-existent column)
CREATE OR REPLACE FUNCTION calculate_hours_worked(clock_in_time TIMESTAMPTZ, clock_out_time TIMESTAMPTZ)
RETURNS NUMERIC AS $$
BEGIN
  IF clock_out_time IS NOT NULL AND clock_in_time IS NOT NULL THEN
    RETURN EXTRACT(EPOCH FROM (clock_out_time - clock_in_time)) / 3600.0;
  END IF;
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get employee current status
CREATE OR REPLACE FUNCTION get_employee_current_status(emp_id UUID)
RETURNS TABLE (
  is_clocked_in BOOLEAN,
  time_entry_id UUID,
  project_id UUID,
  project_name TEXT,
  clock_in TIMESTAMPTZ,
  hours_elapsed NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TRUE as is_clocked_in,
    te.id as time_entry_id,
    te.project_id,
    p.name as project_name,
    te.clock_in,
    EXTRACT(EPOCH FROM (NOW() - te.clock_in)) / 3600.0 as hours_elapsed
  FROM time_entries te
  JOIN projects p ON p.id = te.project_id
  WHERE te.employee_id = emp_id
    AND te.clock_out IS NULL
  ORDER BY te.clock_in DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at on all tables
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_time_entries_updated_at ON time_entries;
CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
