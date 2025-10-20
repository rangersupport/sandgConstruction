-- Clear existing test data and insert fresh data
-- Run this in your Supabase SQL Editor

-- First, clear existing test data (optional - only if you want fresh data)
-- DELETE FROM time_entries WHERE employee_id IN (
--   '550e8400-e29b-41d4-a716-446655440001',
--   '550e8400-e29b-41d4-a716-446655440002',
--   '550e8400-e29b-41d4-a716-446655440003',
--   '550e8400-e29b-41d4-a716-446655440004',
--   '550e8400-e29b-41d4-a716-446655440005'
-- );

-- DELETE FROM employees WHERE id IN (
--   '550e8400-e29b-41d4-a716-446655440001',
--   '550e8400-e29b-41d4-a716-446655440002',
--   '550e8400-e29b-41d4-a716-446655440003',
--   '550e8400-e29b-41d4-a716-446655440004',
--   '550e8400-e29b-41d4-a716-446655440005'
-- );

-- DELETE FROM projects WHERE id IN (
--   '660e8400-e29b-41d4-a716-446655440001',
--   '660e8400-e29b-41d4-a716-446655440002',
--   '660e8400-e29b-41d4-a716-446655440003'
-- );

-- Insert test employees with ON CONFLICT handling (PostgreSQL upsert)
INSERT INTO employees (id, first_name, last_name, phone, email, role, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'John', 'Smith', '+1-555-0101', 'john.smith@sgconstruction.com', 'worker', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'Sarah', 'Johnson', '+1-555-0102', 'sarah.johnson@sgconstruction.com', 'foreman', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'Mike', 'Davis', '+1-555-0103', 'mike.davis@sgconstruction.com', 'worker', 'active'),
('550e8400-e29b-41d4-a716-446655440004', 'Lisa', 'Wilson', '+1-555-0104', 'lisa.wilson@sgconstruction.com', 'manager', 'active'),
('550e8400-e29b-41d4-a716-446655440005', 'Tom', 'Brown', '+1-555-0105', 'tom.brown@sgconstruction.com', 'worker', 'inactive')
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Insert test projects with ON CONFLICT handling
INSERT INTO projects (id, name, address, city, state, zip_code, latitude, longitude, status, start_date, end_date, budget, description) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Downtown Office Building', '123 Main St', 'Austin', 'TX', '78701', 30.2672, -97.7431, 'active', '2024-01-15', '2024-06-30', 500000, 'Commercial office building construction'),
('660e8400-e29b-41d4-a716-446655440002', 'Residential Complex', '456 Oak Ave', 'Austin', 'TX', '78702', 30.2849, -97.7341, 'active', '2024-02-01', '2024-08-15', 750000, 'Multi-unit residential development'),
('660e8400-e29b-41d4-a716-446655440003', 'Shopping Center', '789 Pine St', 'Austin', 'TX', '78703', 30.2500, -97.7500, 'planning', '2024-03-01', '2024-12-31', 1000000, 'Retail shopping center')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  zip_code = EXCLUDED.zip_code,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  status = EXCLUDED.status,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  budget = EXCLUDED.budget,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Verify the data
SELECT 'Employees:' as table_name, count(*) as count FROM employees
UNION ALL
SELECT 'Projects:', count(*) FROM projects;
