-- Fix the ambiguous column reference in verify_employee_pin function
-- This replaces the function from 006_create_auth_functions.sql

DROP FUNCTION IF EXISTS verify_employee_pin(TEXT, TEXT);

CREATE OR REPLACE FUNCTION verify_employee_pin(
  p_employee_number TEXT,
  p_pin TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  employee_id UUID,
  employee_name TEXT,
  employee_role TEXT,
  must_change_pin BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_employee_id UUID;
  v_employee_name TEXT;
  v_employee_role TEXT;
  v_pin_hash TEXT;
  v_must_change_pin BOOLEAN;
  v_failed_attempts INTEGER;
  v_locked_until TIMESTAMPTZ;
  v_pin_valid BOOLEAN;
BEGIN
  -- Find employee by employee_number
  SELECT 
    e.id, 
    e.name, 
    e.role, 
    e.pin_hash, 
    e.must_change_pin, 
    e.failed_login_attempts, 
    e.locked_until
  INTO 
    v_employee_id,
    v_employee_name,
    v_employee_role,
    v_pin_hash,
    v_must_change_pin,
    v_failed_attempts,
    v_locked_until
  FROM employees e
  WHERE e.employee_number = p_employee_number
    AND e.status = 'active';

  -- Check if employee exists
  IF v_employee_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, false, 'Invalid employee number or PIN';
    RETURN;
  END IF;

  -- Check if account is locked
  IF v_locked_until IS NOT NULL AND v_locked_until > NOW() THEN
    RETURN QUERY SELECT 
      false, 
      NULL::UUID, 
      NULL::TEXT, 
      NULL::TEXT, 
      false, 
      'Account is locked. Please contact administrator.';
    RETURN;
  END IF;

  -- Verify PIN (using crypt for bcrypt hashing)
  v_pin_valid := (v_pin_hash = crypt(p_pin, v_pin_hash));

  IF v_pin_valid THEN
    -- Reset failed attempts on successful login
    UPDATE employees
    SET failed_login_attempts = 0,
        locked_until = NULL
    WHERE id = v_employee_id;

    RETURN QUERY SELECT 
      true, 
      v_employee_id, 
      v_employee_name, 
      v_employee_role, 
      v_must_change_pin,
      'Login successful'::TEXT;
  ELSE
    -- Increment failed attempts
    UPDATE employees
    SET failed_login_attempts = failed_login_attempts + 1,
        locked_until = CASE 
          WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '30 minutes'
          ELSE NULL
        END
    WHERE id = v_employee_id;

    RETURN QUERY SELECT 
      false, 
      NULL::UUID, 
      NULL::TEXT, 
      NULL::TEXT, 
      false,
      CASE 
        WHEN v_failed_attempts + 1 >= 5 
        THEN 'Account locked due to too many failed attempts. Please contact administrator.'
        ELSE 'Invalid employee number or PIN'
      END::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
