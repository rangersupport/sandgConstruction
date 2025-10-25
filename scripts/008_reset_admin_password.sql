-- Reset admin password to default
-- This script can be run in Supabase SQL Editor to reset admin access
-- Default password: Admin123!

UPDATE admin_users
SET password_hash = crypt('Admin123!', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'admin@sandgservice.com';

-- Also ensure the admin user exists in Supabase Auth
-- Note: You may need to manually reset the password in Supabase Auth dashboard
-- Go to: Authentication > Users > Find admin@sandgservice.com > Reset Password
