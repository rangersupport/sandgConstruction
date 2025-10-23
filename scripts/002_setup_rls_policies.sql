-- Enable Row Level Security on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations for authenticated users
-- In production, you would want more granular policies based on roles

-- Employees policies
DROP POLICY IF EXISTS "Allow all operations on employees" ON employees;
CREATE POLICY "Allow all operations on employees"
  ON employees
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Projects policies
DROP POLICY IF EXISTS "Allow all operations on projects" ON projects;
CREATE POLICY "Allow all operations on projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Time entries policies
DROP POLICY IF EXISTS "Allow all operations on time_entries" ON time_entries;
CREATE POLICY "Allow all operations on time_entries"
  ON time_entries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anonymous access for the employee clock-in kiosk
-- This is for the employee page where workers clock in/out
DROP POLICY IF EXISTS "Allow anonymous read employees" ON employees;
CREATE POLICY "Allow anonymous read employees"
  ON employees
  FOR SELECT
  TO anon
  USING (status = 'active');

DROP POLICY IF EXISTS "Allow anonymous read projects" ON projects;
CREATE POLICY "Allow anonymous read projects"
  ON projects
  FOR SELECT
  TO anon
  USING (status = 'active');

DROP POLICY IF EXISTS "Allow anonymous time_entries operations" ON time_entries;
CREATE POLICY "Allow anonymous time_entries operations"
  ON time_entries
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
