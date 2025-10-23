-- Create initial admin user for first-time setup
-- Password: Admin123! (must be changed after first login)

INSERT INTO admin_users (email, password_hash, name, role, is_active)
VALUES (
  'admin@sandgservice.com',
  crypt('Admin123!', gen_salt('bf')),
  'System Administrator',
  'super_admin',
  true
)
ON CONFLICT (email) DO NOTHING;

-- Set default PINs for existing employees (they will be required to change on first login)
UPDATE employees
SET pin_hash = crypt('1234', gen_salt('bf')),
    must_change_pin = true
WHERE pin_hash IS NULL;
