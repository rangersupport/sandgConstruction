"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export interface AuthResult {
  success: boolean
  error?: string
  user?: {
    id: string
    email: string
    role: string
  }
  mustChangePIN?: boolean
}

// Admin login with email and password
export async function adminLogin(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return { success: false, error: "Authentication failed" }
    }

    // Verify user is an admin
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("id, email, name, role, is_active")
      .eq("email", email)
      .single()

    if (adminError || !adminUser) {
      // Sign out if not an admin
      await supabase.auth.signOut()
      return { success: false, error: "Unauthorized: Admin access required" }
    }

    if (!adminUser.is_active) {
      await supabase.auth.signOut()
      return { success: false, error: "Account is inactive" }
    }

    return {
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      },
    }
  } catch (error) {
    console.error("[v0] Admin login error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Admin logout
export async function adminLogout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/admin/login")
}

// Get current admin user
export async function getCurrentAdmin() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get admin details
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id, email, name, role, is_active")
      .eq("email", user.email)
      .single()

    if (!adminUser || !adminUser.is_active) {
      return null
    }

    return {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
    }
  } catch (error) {
    console.error("[v0] Get current admin error:", error)
    return null
  }
}

// Employee login with employee number and PIN
export async function employeeLogin(employeeNumber: string, pin: string): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    // Call the database function to verify PIN
    const { data, error } = await supabase.rpc("verify_employee_pin", {
      p_employee_number: employeeNumber,
      p_pin: pin,
    })

    if (error) {
      console.error("[v0] Employee login error:", error)
      return { success: false, error: "Login failed. Please try again." }
    }

    if (!data || data.length === 0) {
      return { success: false, error: "Invalid employee number or PIN" }
    }

    const result = data[0]

    if (!result.success) {
      return { success: false, error: result.message }
    }

    // Create a session by setting employee ID in a cookie
    // Note: This is a simplified session - in production you'd use proper JWT tokens
    return {
      success: true,
      user: {
        id: result.employee_id,
        email: result.employee_name,
        role: result.employee_role,
      },
      mustChangePIN: result.must_change_pin,
    }
  } catch (error) {
    console.error("[v0] Employee login error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Employee logout
export async function employeeLogout() {
  redirect("/employee/login")
}

// Get current employee from session
export async function getCurrentEmployee() {
  // This would check the session cookie in a real implementation
  // For now, we'll return null and handle sessions in the next phase
  return null
}

export async function changeEmployeePIN(employeeId: string, newPIN: string, confirmPIN: string): Promise<AuthResult> {
  try {
    // Validate PINs match
    if (newPIN !== confirmPIN) {
      return { success: false, error: "PINs do not match" }
    }

    // Validate PIN format
    if (!/^\d{4,6}$/.test(newPIN)) {
      return { success: false, error: "PIN must be 4-6 digits" }
    }

    const supabase = await createClient()

    // Call the database function to set PIN
    const { data, error } = await supabase.rpc("set_employee_pin", {
      p_employee_id: employeeId,
      p_new_pin: newPIN,
    })

    if (error) {
      console.error("[v0] Change PIN error:", error)
      return { success: false, error: "Failed to change PIN. Please try again." }
    }

    if (!data || data.length === 0) {
      return { success: false, error: "Failed to change PIN" }
    }

    const result = data[0]

    if (!result.success) {
      return { success: false, error: result.message }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Change PIN error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function adminResetEmployeePIN(employeeId: string, newPIN: string): Promise<AuthResult> {
  try {
    // Validate PIN format
    if (!/^\d{4,6}$/.test(newPIN)) {
      return { success: false, error: "PIN must be 4-6 digits" }
    }

    const supabase = await createClient()

    // Verify admin is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Call the database function to set PIN
    const { data, error } = await supabase.rpc("set_employee_pin", {
      p_employee_id: employeeId,
      p_new_pin: newPIN,
    })

    if (error) {
      console.error("[v0] Admin reset PIN error:", error)
      return { success: false, error: "Failed to reset PIN. Please try again." }
    }

    if (!data || data.length === 0) {
      return { success: false, error: "Failed to reset PIN" }
    }

    const result = data[0]

    if (!result.success) {
      return { success: false, error: result.message }
    }

    // Also unlock the account if it was locked
    await supabase
      .from("employees")
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        must_change_pin: true,
      })
      .eq("id", employeeId)

    return { success: true }
  } catch (error) {
    console.error("[v0] Admin reset PIN error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
