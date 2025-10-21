#!/bin/bash

# S&G Construction - Phase 2 Setup Script
# This script creates all necessary files for the employee clock-in system

echo "🚀 Setting up S&G Construction Phase 2 files..."

# Create directories
echo "📁 Creating directories..."
mkdir -p lib/types
mkdir -p lib/hooks
mkdir -p lib/actions
mkdir -p components/employee
mkdir -p app/employee

# Create lib/types/database.ts
echo "📝 Creating database types..."
cat > lib/types/database.ts << 'EOF'
// Database types for S&G Construction

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  role: 'worker' | 'foreman' | 'manager' | 'admin';
  status: 'active' | 'inactive' | 'terminated';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  address: string;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  employee_id: string;
  project_id: string;
  clock_in: string;
  clock_in_latitude: number | null;
  clock_in_longitude: number | null;
  clock_in_accuracy: number | null;
  clock_out: string | null;
  clock_out_latitude: number | null;
  clock_out_longitude: number | null;
  clock_out_accuracy: number | null;
  hours_worked: number | null;
  notes: string | null;
  status: 'clocked_in' | 'clocked_out' | 'adjusted';
  created_at: string;
  updated_at: string;
}

export interface TimeEntryWithDetails extends TimeEntry {
  employee?: Employee;
  project?: Project;
}

export interface ActiveWorker {
  time_entry_id: string;
  employee_id: string;
  employee_name: string;
  project_id: string;
  project_name: string;
  clock_in: string;
  latitude: number | null;
  longitude: number | null;
  hours_elapsed: number;
}

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface EmployeeStatus {
  is_clocked_in: boolean;
  time_entry_id: string | null;
  project_id: string | null;
  project_name: string | null;
  clock_in: string | null;
  hours_elapsed: number | null;
}
EOF

# Create lib/hooks/use-geolocation.ts
echo "📝 Creating geolocation hook..."
cat > lib/hooks/use-geolocation.ts << 'EOF'
import { useState, useEffect } from 'react';
import type { GeolocationCoordinates, GeolocationError } from '@/lib/types/database';

interface UseGeolocationReturn {
  coordinates: GeolocationCoordinates | null;
  error: GeolocationError | null;
  loading: boolean;
  requestLocation: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by your browser'
      });
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLoading(false);
      },
      (err) => {
        let message = 'Unable to retrieve your location';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable location services.';
            break;
          case err.POSITION_UNAVAILABLE:
            message = 'Location information unavailable.';
            break;
          case err.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }

        setError({
          code: err.code,
          message
        });
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return {
    coordinates,
    error,
    loading,
    requestLocation
  };
}
EOF

# Create lib/actions/time-entry-actions.ts
echo "📝 Creating time entry actions..."
cat > lib/actions/time-entry-actions.ts << 'EOF'
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { TimeEntry, EmployeeStatus } from '@/lib/types/database';

interface ClockInData {
  employeeId: string;
  projectId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface ClockOutData {
  timeEntryId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
}

export async function getEmployeeStatus(employeeId: string): Promise<EmployeeStatus | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('get_employee_current_status', { emp_id: employeeId })
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return {
        is_clocked_in: false,
        time_entry_id: null,
        project_id: null,
        project_name: null,
        clock_in: null,
        hours_elapsed: null
      };
    }
    console.error('Error fetching employee status:', error);
    return null;
  }

  return data;
}

export async function clockIn(data: ClockInData): Promise<{ success: boolean; error?: string; timeEntry?: TimeEntry }> {
  const supabase = await createClient();

  const status = await getEmployeeStatus(data.employeeId);
  if (status?.is_clocked_in) {
    return {
      success: false,
      error: 'You are already clocked in. Please clock out first.'
    };
  }

  const { data: timeEntry, error } = await supabase
    .from('time_entries')
    .insert({
      employee_id: data.employeeId,
      project_id: data.projectId,
      clock_in: new Date().toISOString(),
      clock_in_latitude: data.latitude,
      clock_in_longitude: data.longitude,
      clock_in_accuracy: data.accuracy,
      status: 'clocked_in'
    })
    .select()
    .single();

  if (error) {
    console.error('Error clocking in:', error);
    return {
      success: false,
      error: error.message
    };
  }

  revalidatePath('/employee');
  revalidatePath('/dashboard');

  return {
    success: true,
    timeEntry
  };
}

export async function clockOut(data: ClockOutData): Promise<{ success: boolean; error?: string; timeEntry?: TimeEntry }> {
  const supabase = await createClient();

  const { data: timeEntry, error } = await supabase
    .from('time_entries')
    .update({
      clock_out: new Date().toISOString(),
      clock_out_latitude: data.latitude,
      clock_out_longitude: data.longitude,
      clock_out_accuracy: data.accuracy,
      status: 'clocked_out'
    })
    .eq('id', data.timeEntryId)
    .select()
    .single();

  if (error) {
    console.error('Error clocking out:', error);
    return {
      success: false,
      error: error.message
    };
  }

  revalidatePath('/employee');
  revalidatePath('/dashboard');

  return {
    success: true,
    timeEntry
  };
}

export async function getActiveProjects() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'active')
    .order('name');

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return data;
}

export async function getTodayHours(employeeId: string): Promise<number> {
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('time_entries')
    .select('hours_worked')
    .eq('employee_id', employeeId)
    .gte('clock_in', today.toISOString())
    .not('hours_worked', 'is', null);

  if (error) {
    console.error('Error fetching today hours:', error);
    return 0;
  }

  return data.reduce((sum, entry) => sum + (entry.hours_worked || 0), 0);
}
EOF

# Create components/employee/time-clock.tsx
echo "📝 Creating time clock component..."
cat > components/employee/time-clock.tsx << 'EOF'
'use client';

import { useState, useEffect } from 'react';
import { useGeolocation } from '@/lib/hooks/use-geolocation';
import { clockIn, clockOut, getEmployeeStatus, getActiveProjects, getTodayHours } from '@/lib/actions/time-entry-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Project, EmployeeStatus } from '@/lib/types/database';

interface TimeClockProps {
  employeeId: string;
  employeeName: string;
}

export function TimeClock({ employeeId, employeeName }: TimeClockProps) {
  const { coordinates, error: gpsError, loading: gpsLoading, requestLocation } = useGeolocation();
  
  const [status, setStatus] = useState<EmployeeStatus | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [todayHours, setTodayHours] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<string>('0:00');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [employeeId]);

  useEffect(() => {
    if (!status?.is_clocked_in || !status.clock_in) return;

    const updateElapsed = () => {
      const clockInTime = new Date(status.clock_in!);
      const now = new Date();
      const diffMs = now.getTime() - clockInTime.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setElapsedTime(`${hours}:${minutes.toString().padStart(2, '0')}`);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 60000);

    return () => clearInterval(interval);
  }, [status]);

  async function loadData() {
    try {
      const [statusData, projectsData, hoursData] = await Promise.all([
        getEmployeeStatus(employeeId),
        getActiveProjects(),
        getTodayHours(employeeId)
      ]);

      setStatus(statusData);
      setProjects(projectsData);
      setTodayHours(hoursData);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    }
  }

  async function handleClockIn() {
    if (!selectedProjectId) {
      setMessage({ type: 'error', text: 'Please select a project' });
      return;
    }

    if (!coordinates) {
      setMessage({ type: 'error', text: 'Waiting for GPS location...' });
      requestLocation();
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await clockIn({
      employeeId,
      projectId: selectedProjectId,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      accuracy: coordinates.accuracy
    });

    if (result.success) {
      setMessage({ type: 'success', text: 'Clocked in successfully!' });
      await loadData();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to clock in' });
    }

    setLoading(false);
  }

  async function handleClockOut() {
    if (!status?.time_entry_id) {
      setMessage({ type: 'error', text: 'No active clock-in found' });
      return;
    }

    if (!coordinates) {
      setMessage({ type: 'error', text: 'Waiting for GPS location...' });
      requestLocation();
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await clockOut({
      timeEntryId: status.time_entry_id,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      accuracy: coordinates.accuracy
    });

    if (result.success) {
      setMessage({ type: 'success', text: 'Clocked out successfully!' });
      await loadData();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to clock out' });
    }

    setLoading(false);
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome, {employeeName}</CardTitle>
          <CardDescription>S&G Construction Time Clock</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={status?.is_clocked_in ? 'default' : 'secondary'} className="text-lg px-4 py-1">
              {status?.is_clocked_in ? 'Clocked In' : 'Clocked Out'}
            </Badge>
          </div>

          {status?.is_clocked_in && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Project:</span>
                <span className="font-semibold">{status.project_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Time Elapsed:</span>
                <span className="font-mono text-2xl font-bold">{elapsedTime}</span>
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Today's Total:</span>
            <span className="font-semibold">{todayHours.toFixed(2)} hours</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <MapPin className={`w-5 h-5 ${coordinates ? 'text-green-500' : 'text-yellow-500'}`} />
            <div className="flex-1">
              {gpsLoading && <span className="text-muted-foreground">Getting location...</span>}
              {gpsError && (
                <span className="text-destructive text-sm">{gpsError.message}</span>
              )}
              {coordinates && (
                <span className="text-sm text-muted-foreground">
                  Location: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                  {' '}(±{coordinates.accuracy.toFixed(0)}m)
                </span>
              )}
            </div>
            {gpsError && (
              <Button variant="outline" size="sm" onClick={requestLocation}>
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time Clock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!status?.is_clocked_in && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Select Project</label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            className="w-full h-16 text-lg font-semibold"
            variant={status?.is_clocked_in ? 'destructive' : 'default'}
            onClick={status?.is_clocked_in ? handleClockOut : handleClockIn}
            disabled={loading || gpsLoading || (!coordinates && !gpsError)}
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {status?.is_clocked_in ? 'Clock Out' : 'Clock In'}
          </Button>

          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
EOF

# Create app/employee/page.tsx
echo "📝 Creating employee page..."
cat > app/employee/page.tsx << 'EOF'
import { TimeClock } from '@/components/employee/time-clock';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function EmployeePage() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/auth/login');
  }

  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('*')
    .eq('status', 'active')
    .limit(1)
    .single();

  if (employeeError || !employee) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Employee Not Found</h1>
          <p className="text-muted-foreground">
            No active employee record found. Please contact your manager.
          </p>
        </div>
      </div>
    );
  }

  const employeeName = `${employee.first_name} ${employee.last_name}`;

  return (
    <div className="min-h-screen bg-background">
      <TimeClock 
        employeeId={employee.id} 
        employeeName={employeeName}
      />
    </div>
  );
}
EOF

echo ""
echo "✅ All Phase 2 files created successfully!"
echo ""
echo "📂 Files created:"
echo "  - lib/types/database.ts"
echo "  - lib/hooks/use-geolocation.ts"
echo "  - lib/actions/time-entry-actions.ts"
echo "  - components/employee/time-clock.tsx"
echo "  - app/employee/page.tsx"
echo ""
echo "🚀 Next steps:"
echo "  1. Run: npm run dev"
echo "  2. Navigate to: http://localhost:3000/employee"
echo "  3. Test the clock-in functionality"
echo ""
echo "✨ Phase 2 setup complete!"
EOF

chmod +x setup-phase2.sh

echo "✅ Setup script created successfully!"
