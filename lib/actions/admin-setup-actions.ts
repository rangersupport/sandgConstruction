"use server"

import { createClient } from "@supabase/supabase-js"

export async function createFirstAdmin(email: string, password: string) {
  try {
    console.log("[v0] Admin setup: Starting account creation")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("[v0] Admin setup: Environment check", {
      hasUrl: !!supabaseUrl,
      hasKey: !!serviceRoleKey,
    })

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[v0] Admin setup: Missing environment variables")
      return {
        success: false,
        error: "Server configuration error: Missing Supabase credentials",
      }
    }

    // Create a Supabase client with service role (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[v0] Admin setup: Supabase client created")

    // Check if any admins already exist
    const { data: existingAdmins, error: checkError } = await supabaseAdmin.from("admin_users").select("id").limit(1)

    if (checkError) {
      console.error("[v0] Admin setup: Error checking existing admins:", checkError)
      return { success: false, error: "Failed to check existing admins" }
    }

    if (existingAdmins && existingAdmins.length > 0) {
      console.log("[v0] Admin setup: Admin already exists")
      return {
        success: false,
        error: "An admin account already exists. Please contact support.",
      }
    }

    console.log("[v0] Admin setup: Creating auth user")

    // Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "admin",
      },
    })

    if (authError) {
      console.error("[v0] Admin setup: Auth error:", authError)
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: "Failed to create user" }
    }

    console.log("[v0] Admin setup: Auth user created:", authData.user.id)

    // Add to admin_users table
    const { error: insertError } = await supabaseAdmin.from("admin_users").insert({
      id: authData.user.id,
      email: email,
      name: "Administrator",
      role: "super_admin",
      is_active: true,
    })

    if (insertError) {
      console.error("[v0] Admin setup: Insert error:", insertError)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: insertError.message }
    }

    console.log("[v0] Admin setup: Success!")
    return { success: true, userId: authData.user.id }
  } catch (error: any) {
    console.error("[v0] Admin setup: Unexpected error:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
