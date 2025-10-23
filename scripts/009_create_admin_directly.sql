-- Create admin user directly in Supabase
-- Run this in Supabase SQL Editor to create admin access
-- Email: admin@sandgservice.com
-- Password: Admin123!

-- Delete existing admin if exists
DELETE FROM admin_users WHERE email = 'admin@sandgservice.com';

-- Insert new admin with hashed password
INSERT INTO admin_users (email, password_hash, name, role, is_active)
VALUES (
  'admin@sandgservice.com',
  crypt('Admin123!', gen_salt('bf')),
  'System Administrator',
  'admin',
  true
);

-- Verify the admin was created
SELECT id, email, name, role, is_active, created_at FROM admin_users WHERE email = 'admin@sandgservice.com';
