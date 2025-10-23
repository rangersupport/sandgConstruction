-- Create admin user directly in Supabase
-- Run this in Supabase SQL Editor to create admin access
-- Email: admin@sandgservice.com
-- Password: Admin123!

-- First, ensure the admin_users table exists
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delete existing admin if exists
DELETE FROM admin_users WHERE email = 'admin@sandgservice.com';

-- Insert new admin with hashed password
INSERT INTO admin_users (email, password_hash, full_name)
VALUES (
  'admin@sandgservice.com',
  crypt('Admin123!', gen_salt('bf')),
  'System Administrator'
);

-- Verify the admin was created
SELECT id, email, full_name, created_at FROM admin_users WHERE email = 'admin@sandgservice.com';
