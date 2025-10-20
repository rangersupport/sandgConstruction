-- Test data for S&G Construction Employee Management System
-- Run this in your Supabase SQL Editor to add test employees

-- Insert test employees with proper UUIDs
INSERT INTO employees (id, first_name, last_name, phone, email, role, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'John', 'Smith', '+1-555-0101', 'john.smith@sgconstruction.com', 'worker', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'Sarah', 'Johnson', '+1-555-0102', 'sarah.johnson@sgconstruction.com', 'foreman', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'Mike', 'Davis', '+1-555-0103', 'mike.davis@sgconstruction.com', 'worker', 'active'),
('550e8400-e29b-41d4-a716-446655440004', 'Lisa', 'Wilson', '+1-555-0104', 'lisa.wilson@sgconstruction.com', 'manager', 'active'),
('550e8400-e29b-41d4-a716-446655440005', 'Tom', 'Brown', '+1-555-0105', 'tom.brown@sgconstruction.com', 'worker', 'inactive');

-- Insert test projects with proper UUIDs
INSERT INTO projects (id, name, address, city, state, zip_code, latitude, longitude, status, start_date, end_date, budget, description) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Downtown Office Building', '123 Main St', 'Austin', 'TX', '78701', 30.2672, -97.7431, 'active', '2024-01-15', '2024-06-30', 500000, 'Commercial office building construction'),
('660e8400-e29b-41d4-a716-446655440002', 'Residential Complex', '456 Oak Ave', 'Austin', 'TX', '78702', 30.2849, -97.7341, 'active', '2024-02-01', '2024-08-15', 750000, 'Multi-unit residential development'),
('660e8400-e29b-41d4-a716-446655440003', 'Shopping Center', '789 Pine St', 'Austin', 'TX', '78703', 30.2500, -97.7500, 'planning', '2024-03-01', '2024-12-31', 1000000, 'Retail shopping center');

-- Verify the data was inserted
SELECT 'Employees:' as table_name, count(*) as count FROM employees
UNION ALL
SELECT 'Projects:', count(*) FROM projects;
