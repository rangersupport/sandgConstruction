-- Add GPS coordinates and payroll fields to support location tracking and payment calculations

-- Update projects table to include GPS coordinates for site verification
ALTER TABLE projects ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS geofence_radius INTEGER DEFAULT 100; -- radius in meters

-- Update time_entries to store GPS coordinates as JSON
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS clock_in_lat DECIMAL(10, 8);
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS clock_in_lng DECIMAL(11, 8);
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS clock_out_lat DECIMAL(10, 8);
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS clock_out_lng DECIMAL(11, 8);
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS location_verified BOOLEAN DEFAULT false;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS hours_worked DECIMAL(10, 2);

-- Update employees table for payroll
ALTER TABLE employees ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2) DEFAULT 15.00;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS overtime_rate DECIMAL(10, 2) DEFAULT 22.50;

-- Create payroll table
CREATE TABLE IF NOT EXISTS payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  regular_hours DECIMAL(10, 2) DEFAULT 0,
  overtime_hours DECIMAL(10, 2) DEFAULT 0,
  total_hours DECIMAL(10, 2) DEFAULT 0,
  regular_pay DECIMAL(10, 2) DEFAULT 0,
  overtime_pay DECIMAL(10, 2) DEFAULT 0,
  total_pay DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, approved, paid
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster payroll queries
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_week ON payroll(week_start, week_end);
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_date ON time_entries(employee_id, clock_in);

-- Function to calculate distance between two GPS coordinates (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL, lng1 DECIMAL,
  lat2 DECIMAL, lng2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  earth_radius DECIMAL := 6371000; -- Earth's radius in meters
  dlat DECIMAL;
  dlng DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := radians(lat2 - lat1);
  dlng := radians(lng2 - lng1);
  
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlng/2) * sin(dlng/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to verify if clock-in location is within project geofence
CREATE OR REPLACE FUNCTION verify_location(
  entry_lat DECIMAL,
  entry_lng DECIMAL,
  project_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  project_lat DECIMAL;
  project_lng DECIMAL;
  geofence DECIMAL;
  distance DECIMAL;
BEGIN
  SELECT latitude, longitude, geofence_radius 
  INTO project_lat, project_lng, geofence
  FROM projects 
  WHERE id = project_id;
  
  IF project_lat IS NULL OR project_lng IS NULL THEN
    RETURN false;
  END IF;
  
  distance := calculate_distance(entry_lat, entry_lng, project_lat, project_lng);
  
  RETURN distance <= geofence;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate hours and verify location
CREATE OR REPLACE FUNCTION calculate_time_entry_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate hours worked when clocking out
  IF NEW.clock_out IS NOT NULL AND NEW.clock_in IS NOT NULL THEN
    NEW.hours_worked := EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600;
  END IF;
  
  -- Verify clock-in location
  IF NEW.clock_in_lat IS NOT NULL AND NEW.clock_in_lng IS NOT NULL AND NEW.project_id IS NOT NULL THEN
    NEW.location_verified := verify_location(NEW.clock_in_lat, NEW.clock_in_lng, NEW.project_id);
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS time_entry_hours_trigger ON time_entries;
CREATE TRIGGER time_entry_hours_trigger
  BEFORE INSERT OR UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_time_entry_hours();

-- Update sample projects with GPS coordinates (Florida locations)
UPDATE projects SET 
  latitude = 25.7617,
  longitude = -80.1918,
  geofence_radius = 150
WHERE name = 'Residential Construction';

UPDATE projects SET 
  latitude = 26.1224,
  longitude = -80.1373,
  geofence_radius = 200
WHERE name = 'Commercial Renovation';

UPDATE projects SET 
  latitude = 25.9420,
  longitude = -80.2456,
  geofence_radius = 100
WHERE name = 'Infrastructure Project';
