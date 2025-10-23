import { createClient } from "@/lib/supabase/server"

export interface Employee {
  id: string
  name: string
  email?: string
  phone?: string
  role?: string
  status?: string
}

/**
 * Get employee by ID from Supabase
 */
export async function getEmployeeById(employeeId: string): Promise<Employee | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("employees")
    .select("id, name, email, phone, role, status")
    .eq("id", employeeId)
    .single()

  if (error) {
    console.error("[v0] Error fetching employee:", error)
    return null
  }

  return data
}

/**
 * Get all active employees
 */
export async function getActiveEmployees(): Promise<Employee[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("employees")
    .select("id, name, email, phone, role, status")
    .eq("status", "active")
    .order("name")

  if (error) {
    console.error("[v0] Error fetching employees:", error)
    return []
  }

  return data || []
}
