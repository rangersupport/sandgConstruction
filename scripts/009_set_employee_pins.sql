-- Set default PIN (1234) for all employees using proper bcrypt hashing
-- This script uses the pgcrypto extension to generate proper bcrypt hashes

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update all employees with properly hashed PIN "1234"
UPDATE employees
SET pin_hash = crypt('1234', gen_salt('bf')),
    must_change_pin = true
WHERE pin_hash IS NOT NULL OR pin_hash = '';

-- Verify the update
SELECT 
  employee_number,
  name,
  CASE 
    WHEN pin_hash IS NOT NULL AND pin_hash != '' THEN 'PIN Set'
    ELSE 'No PIN'
  END as pin_status
FROM employees
ORDER BY employee_number
LIMIT 10;
