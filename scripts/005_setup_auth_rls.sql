-- Enable RLS on admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users can only be accessed by authenticated admins
CREATE POLICY "Admins can view all admin users"
  ON admin_users
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Super admins can insert admin users"
  ON admin_users
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update their own record"
  ON admin_users
  FOR UPDATE
  USING (auth.uid()::TEXT = id::TEXT);

-- Update employees RLS policies for employee authentication
DROP POLICY IF EXISTS "Allow public read access to active employees" ON employees;
DROP POLICY IF EXISTS "Allow public read access to all employees" ON employees;

-- Employees can view their own record
CREATE POLICY "Employees can view own record"
  ON employees
  FOR SELECT
  USING (
    auth.uid()::TEXT = id::TEXT
    OR auth.role() = 'authenticated'
  );

-- Only authenticated users (admins) can insert/update/delete employees
CREATE POLICY "Admins can manage employees"
  ON employees
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Update time_entries RLS for employee access
DROP POLICY IF EXISTS "Allow authenticated users to manage time entries" ON time_entries;

-- Employees can view their own time entries
CREATE POLICY "Employees can view own time entries"
  ON time_entries
  FOR SELECT
  USING (
    auth.uid()::TEXT = employee_id::TEXT
    OR auth.role() = 'authenticated'
  );

-- Employees can insert their own time entries
CREATE POLICY "Employees can create own time entries"
  ON time_entries
  FOR INSERT
  WITH CHECK (auth.uid()::TEXT = employee_id::TEXT);

-- Employees can update their own time entries
CREATE POLICY "Employees can update own time entries"
  ON time_entries
  FOR UPDATE
  USING (auth.uid()::TEXT = employee_id::TEXT);

-- Admins can manage all time entries
CREATE POLICY "Admins can manage all time entries"
  ON time_entries
  FOR ALL
  USING (auth.role() = 'authenticated');
