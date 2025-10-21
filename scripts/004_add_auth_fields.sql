-- Add authentication fields to employees table
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS employee_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS pin_hash TEXT,
ADD COLUMN IF NOT EXISTS must_change_pin BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- Create index on employee_number for fast lookups
CREATE INDEX IF NOT EXISTS idx_employees_employee_number ON employees(employee_number);

-- Create admin_users table for admin authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on admin email for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Update existing employees with employee numbers (starting from 1001)
DO $$
DECLARE
  emp RECORD;
  counter INTEGER := 1001;
BEGIN
  FOR emp IN SELECT id FROM employees WHERE employee_number IS NULL ORDER BY created_at
  LOOP
    UPDATE employees 
    SET employee_number = counter::TEXT
    WHERE id = emp.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Make employee_number NOT NULL after populating existing records
ALTER TABLE employees
ALTER COLUMN employee_number SET NOT NULL;
