-- Nuclear Admin Fix - This will work regardless of current database state
-- Run this in Supabase SQL Editor

-- Step 1: Delete any existing admin user from auth.users
DELETE FROM auth.users WHERE email = 'admin@sandgservice.com';

-- Step 2: Delete any existing admin from admin_users table
DELETE FROM admin_users WHERE email = 'admin@sandgservice.com';

-- Step 3: Create the admin user in Supabase Auth
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
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
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Step 4: Create the admin user in admin_users table
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

-- Step 5: Verify both records were created
SELECT 'Auth User:' as type, email, created_at FROM auth.users WHERE email = 'admin@sandgservice.com'
UNION ALL
SELECT 'Admin User:' as type, email, created_at FROM admin_users WHERE email = 'admin@sandgservice.com';
