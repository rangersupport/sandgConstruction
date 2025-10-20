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
