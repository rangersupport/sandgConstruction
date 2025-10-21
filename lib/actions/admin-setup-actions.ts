"use server"

import { createClient } from "@supabase/supabase-js"
import { supabaseConfig } from "@/lib/supabase/config"

export async function createFirstAdmin(email: string, password: string) {
  try {
    console.log("[v0] Server: Creating first admin with service role")

    // Create a Supabase client with service role (bypasses RLS)
    const supabaseAdmin = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if any admins already exist
    const { data: existingAdmins, error: checkError } = await supabaseAdmin.from("admin_users").select("id").limit(1)

    if (checkError) {
      console.error("[v0] Server: Error checking existing admins:", checkError)
      return { success: false, error: "Failed to check existing admins" }
    }

    if (existingAdmins && existingAdmins.length > 0) {
      console.log("[v0] Server: Admin already exists, blocking creation")
      return { success: false, error: "An admin account already exists. Please contact support." }
    }

    // Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: "admin",
      },
    })

    if (authError) {
      console.error("[v0] Server: Error creating auth user:", authError)
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: "Failed to create user" }
    }

    console.log("[v0] Server: Auth user created:", authData.user.id)

    // Add to admin_users table (using service role bypasses RLS)
    const { error: insertError } = await supabaseAdmin.from("admin_users").insert({
      id: authData.user.id,
      email: email,
      name: "Administrator",
      role: "super_admin",
      is_active: true,
    })

    if (insertError) {
      console.error("[v0] Server: Error inserting into admin_users:", insertError)
      // Try to delete the auth user if admin_users insert failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: insertError.message }
    }

    console.log("[v0] Server: Admin user created successfully")

    return { success: true, userId: authData.user.id }
  } catch (error: any) {
    console.error("[v0] Server: Unexpected error:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
