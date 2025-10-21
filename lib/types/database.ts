// Database types for S&G Construction

export interface Employee {
  id: string
  first_name: string
  last_name: string
  phone: string | null
  email: string | null
  role: "worker" | "foreman" | "manager" | "admin"
  status: "active" | "inactive" | "terminated"
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  address: string
  city: string | null
  state: string | null
  zip_code: string | null
  latitude: number | null
  longitude: number | null
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled"
  start_date: string | null
  end_date: string | null
  budget: number | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface TimeEntry {
  id: string
  employee_id: string
  project_id: string
  clock_in: string
  clock_in_latitude: number | null
  clock_in_longitude: number | null
  clock_in_accuracy: number | null
  clock_out: string | null
  clock_out_latitude: number | null
  clock_out_longitude: number | null
  clock_out_accuracy: number | null
  hours_worked: number | null
  notes: string | null
  status: "clocked_in" | "clocked_out" | "adjusted"
  created_at: string
  updated_at: string
}

export interface TimeEntryWithDetails extends TimeEntry {
  employee?: Employee
  project?: Project
}

export interface ActiveWorker {
  time_entry_id: string
  employee_id: string
  employee_name: string
  project_id: string
  project_name: string
  clock_in: string
  latitude: number | null
  longitude: number | null
  hours_elapsed: number
}

export interface GeolocationCoordinates {
  latitude: number
  longitude: number
  accuracy: number
}

export interface GeolocationError {
  code: number
  message: string
}

export interface EmployeeStatus {
  is_clocked_in: boolean
  time_entry_id: string | null
  project_id: string | null
  project_name: string | null
  clock_in: string | null
  hours_elapsed: number | null
}

export interface EmployeePreferences {
  id: string
  employee_id: string
  reminder_hours: number
  auto_clockout_minutes: number
  notification_method: "sms" | "whatsapp" | "email" | "push"
  phone_number: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export interface ClockReminder {
  id: string
  time_entry_id: string
  reminder_sent_at: string | null
  reminder_acknowledged: boolean
  auto_clockout_triggered: boolean
  auto_clockout_at: string | null
  created_at: string
  updated_at: string
}

export interface EmployeeNeedingReminder {
  time_entry_id: string
  employee_id: string
  employee_name: string
  employee_phone: string | null
  employee_email: string | null
  project_id: string
  project_name: string
  clock_in: string
  hours_elapsed: number
  reminder_hours: number
  notification_method: string
}

export interface EmployeeNeedingAutoClockout {
  time_entry_id: string
  employee_id: string
  employee_name: string
  project_id: string
  project_name: string
  clock_in: string
  reminder_sent_at: string
  auto_clockout_minutes: number
}
