-- Complete admin account creation
-- This creates both the Supabase Auth user AND the admin_users record

-- First ensure the email column has a unique constraint
ALTER TABLE admin_users 
ADD CONSTRAINT admin_users_email_key UNIQUE (email);

-- Delete existing records to avoid conflicts
DELETE FROM admin_users WHERE email = 'admin@sandgservice.com';
DELETE FROM auth.users WHERE email = 'admin@sandgservice.com';

-- Step 1: Insert into Supabase Auth (auth.users table)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@sandgservice.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Step 2: Create admin_users record
INSERT INTO admin_users (email, password_hash, name, role, is_active, created_at, updated_at)
VALUES (
  'admin@sandgservice.com',
  crypt('Admin123!', gen_salt('bf')),
  'System Administrator',
  'admin',
  true,
  NOW(),
  NOW()
);

-- Verify the admin was created
SELECT email, name, role, is_active FROM admin_users WHERE email = 'admin@sandgservice.com';
