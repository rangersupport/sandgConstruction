-- Insert sample employees if they don't exist
INSERT INTO employees (id, first_name, last_name, phone, email, role, status)
VALUES 
  (gen_random_uuid(), 'John', 'Smith', '555-0101', 'john.smith@sandg.com', 'worker', 'active'),
  (gen_random_uuid(), 'Maria', 'Garcia', '555-0102', 'maria.garcia@sandg.com', 'worker', 'active'),
  (gen_random_uuid(), 'David', 'Johnson', '555-0103', 'david.johnson@sandg.com', 'foreman', 'active'),
  (gen_random_uuid(), 'Sarah', 'Williams', '555-0104', 'sarah.williams@sandg.com', 'worker', 'active'),
  (gen_random_uuid(), 'Michael', 'Brown', '555-0105', 'michael.brown@sandg.com', 'manager', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample projects if they don't exist
INSERT INTO projects (id, name, location, status)
VALUES 
  (gen_random_uuid(), 'Downtown Office Complex', '123 Main St, Miami, FL', 'active'),
  (gen_random_uuid(), 'Residential Development - Phase 2', '456 Oak Ave, Tampa, FL', 'active'),
  (gen_random_uuid(), 'Shopping Center Renovation', '789 Commerce Blvd, Orlando, FL', 'active'),
  (gen_random_uuid(), 'Warehouse Expansion', '321 Industrial Way, Jacksonville, FL', 'planning')
ON CONFLICT DO NOTHING;
