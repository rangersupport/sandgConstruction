-- Function to verify employee PIN
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
  v_employee RECORD;
  v_pin_valid BOOLEAN;
BEGIN
  -- Find employee by employee_number
  SELECT id, name, role, pin_hash, must_change_pin, failed_login_attempts, locked_until
  INTO v_employee
  FROM employees
  WHERE employee_number = p_employee_number
    AND status = 'active';

  -- Check if employee exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, false, 'Invalid employee number or PIN';
    RETURN;
  END IF;

  -- Check if account is locked
  IF v_employee.locked_until IS NOT NULL AND v_employee.locked_until > NOW() THEN
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
  v_pin_valid := (v_employee.pin_hash = crypt(p_pin, v_employee.pin_hash));

  IF v_pin_valid THEN
    -- Reset failed attempts on successful login
    UPDATE employees
    SET failed_login_attempts = 0,
        locked_until = NULL
    WHERE id = v_employee.id;

    RETURN QUERY SELECT 
      true, 
      v_employee.id, 
      v_employee.name, 
      v_employee.role, 
      v_employee.must_change_pin,
      'Login successful';
  ELSE
    -- Increment failed attempts
    UPDATE employees
    SET failed_login_attempts = failed_login_attempts + 1,
        locked_until = CASE 
          WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '30 minutes'
          ELSE NULL
        END
    WHERE id = v_employee.id;

    RETURN QUERY SELECT 
      false, 
      NULL::UUID, 
      NULL::TEXT, 
      NULL::TEXT, 
      false,
      CASE 
        WHEN v_employee.failed_login_attempts + 1 >= 5 
        THEN 'Account locked due to too many failed attempts. Please contact administrator.'
        ELSE 'Invalid employee number or PIN'
      END;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set/change employee PIN
CREATE OR REPLACE FUNCTION set_employee_pin(
  p_employee_id UUID,
  p_new_pin TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
BEGIN
  -- Validate PIN format (4-6 digits)
  IF p_new_pin !~ '^\d{4,6}$' THEN
    RETURN QUERY SELECT false, 'PIN must be 4-6 digits';
    RETURN;
  END IF;

  -- Check for weak PINs
  IF p_new_pin IN ('0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '4321') THEN
    RETURN QUERY SELECT false, 'PIN is too weak. Please choose a different PIN.';
    RETURN;
  END IF;

  -- Update PIN (hash it with bcrypt)
  UPDATE employees
  SET pin_hash = crypt(p_new_pin, gen_salt('bf')),
      must_change_pin = false,
      failed_login_attempts = 0,
      locked_until = NULL,
      updated_at = NOW()
  WHERE id = p_employee_id;

  RETURN QUERY SELECT true, 'PIN updated successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
