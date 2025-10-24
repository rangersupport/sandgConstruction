"use server"

import { fileMaker } from "@/lib/filemaker/client"
import { FILEMAKER_LAYOUTS, EMPLOYEE_FIELDS } from "@/lib/filemaker/config"
import { createClient } from "@supabase/supabase-js"
import { supabaseConfig } from "@/lib/supabase/config"

export async function syncEmployeesFromFileMaker() {
  try {
    console.log("[v0] Starting FileMaker to Supabase employee sync...")

    // Use service role key to bypass RLS for admin operations
    if (!supabaseConfig.serviceRoleKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for sync operations")
    }

    const supabaseAdmin = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Fetch all employees from FileMaker
    console.log("[v0] Fetching employees from FileMaker...")
    const fileMakerResult = await fileMaker.getRecords(FILEMAKER_LAYOUTS.EMPLOYEES, 500)

    if (!fileMakerResult.response.data || fileMakerResult.response.data.length === 0) {
      return {
        success: false,
        error: "No employees found in FileMaker",
      }
    }

    const fileMakerEmployees = fileMakerResult.response.data

    console.log(`[v0] Found ${fileMakerEmployees.length} employees in FileMaker`)

    // Get existing employees from Supabase
    const { data: existingEmployees, error: fetchError } = await supabaseAdmin
      .from("employees")
      .select("id, employee_number")

    if (fetchError) {
      console.error("[v0] Error fetching existing employees from Supabase:", fetchError)
      throw fetchError
    }

    const existingEmployeeNumbers = new Set(existingEmployees?.map((e) => e.employee_number) || [])
    const existingEmployeeMap = new Map(existingEmployees?.map((e) => [e.employee_number, e.id]) || [])

    let insertedCount = 0
    let updatedCount = 0
    let skippedCount = 0
    const errors: string[] = []

    // Process each FileMaker employee
    for (const fmRecord of fileMakerEmployees) {
      const fieldData = fmRecord.fieldData

      // Extract employee data from FileMaker
      const employeeNumber = fieldData[EMPLOYEE_FIELDS.EMPLOYEE_LOGIN_NUMBER] || fieldData[EMPLOYEE_FIELDS.ID]
      const firstName = fieldData[EMPLOYEE_FIELDS.NAME_FIRST]
      const lastName = fieldData[EMPLOYEE_FIELDS.NAME_LAST]
      const fullName = fieldData[EMPLOYEE_FIELDS.NAME_FULL] || `${firstName} ${lastName}`.trim()

      // Skip if no employee number
      if (!employeeNumber) {
        console.log(`[v0] Skipping employee without employee number: ${fullName}`)
        skippedCount++
        continue
      }

      // Prepare employee data for Supabase
      const employeeData = {
        employee_number: String(employeeNumber),
        name: fullName || "Unknown",
        email: fieldData[EMPLOYEE_FIELDS.EMAIL] || null,
        phone: fieldData[EMPLOYEE_FIELDS.CELL] || fieldData[EMPLOYEE_FIELDS.PHONE1] || null,
        role: fieldData[EMPLOYEE_FIELDS.CATEGORY] || "employee",
        status: fieldData[EMPLOYEE_FIELDS.STATUS] === "Active" ? "active" : "inactive",
        hourly_rate: fieldData[EMPLOYEE_FIELDS.HOURLY_RATE]
          ? Number.parseFloat(fieldData[EMPLOYEE_FIELDS.HOURLY_RATE])
          : null,
        overtime_rate: fieldData[EMPLOYEE_FIELDS.HOURLY_RATE]
          ? Number.parseFloat(fieldData[EMPLOYEE_FIELDS.HOURLY_RATE]) * 1.5
          : null,
      }

      try {
        if (existingEmployeeNumbers.has(employeeData.employee_number)) {
          // Update existing employee
          const existingId = existingEmployeeMap.get(employeeData.employee_number)

          const { error: updateError } = await supabaseAdmin.from("employees").update(employeeData).eq("id", existingId)

          if (updateError) {
            console.error(`[v0] Error updating employee ${employeeData.employee_number}:`, updateError)
            errors.push(`Failed to update ${employeeData.name}: ${updateError.message}`)
          } else {
            console.log(`[v0] Updated employee: ${employeeData.name} (${employeeData.employee_number})`)
            updatedCount++
          }
        } else {
          // Insert new employee
          const { data: insertedEmployee, error: insertError } = await supabaseAdmin
            .from("employees")
            .insert(employeeData)
            .select("id")
            .single()

          if (insertError) {
            console.error(`[v0] Error inserting employee ${employeeData.employee_number}:`, insertError)
            errors.push(`Failed to insert ${employeeData.name}: ${insertError.message}`)
          } else {
            console.log(`[v0] Inserted new employee: ${employeeData.name} (${employeeData.employee_number})`)

            // Set default PIN if available from FileMaker
            const pinHash = fieldData[EMPLOYEE_FIELDS.PIN_HASH]
            if (pinHash && insertedEmployee) {
              try {
                // Set the PIN using the RPC function
                const { error: pinError } = await supabaseAdmin.rpc("set_employee_pin", {
                  p_employee_id: insertedEmployee.id,
                  p_pin: pinHash,
                })

                if (pinError) {
                  console.error(`[v0] Error setting PIN for ${employeeData.name}:`, pinError)
                  errors.push(`Failed to set PIN for ${employeeData.name}: ${pinError.message}`)
                }
              } catch (pinError) {
                console.error(`[v0] Error setting PIN for ${employeeData.name}:`, pinError)
              }
            }

            insertedCount++
          }
        }
      } catch (error) {
        console.error(`[v0] Error processing employee ${employeeData.employee_number}:`, error)
        errors.push(`Failed to process ${employeeData.name}: ${error}`)
      }
    }

    const summary = {
      success: true,
      total: fileMakerEmployees.length,
      inserted: insertedCount,
      updated: updatedCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined,
    }

    console.log("[v0] Sync completed:", summary)

    return summary
  } catch (error) {
    console.error("[v0] FileMaker to Supabase sync error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred during sync",
    }
  }
}

export async function getSyncStatus() {
  try {
    const supabase = await createSupabaseClient()

    // Get last sync time from a sync_log table if it exists
    // For now, we'll return basic info
    const { data: employeeCount, error } = await supabase.from("employees").select("id", { count: "exact", head: true })

    if (error) {
      throw error
    }

    return {
      success: true,
      employeeCount: employeeCount || 0,
    }
  } catch (error) {
    console.error("[v0] Error getting sync status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

async function createSupabaseClient() {
  const { createClient: createServerClient } = await import("@/lib/supabase/server")
  return createServerClient()
}
