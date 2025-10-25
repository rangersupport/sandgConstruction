import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { supabaseConfig } from "@/lib/supabase/config"

// This endpoint receives employee data pushed from FileMaker
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] API: Received employee push from FileMaker")

    // Verify authorization (you should add a secret token)
    const authHeader = request.headers.get("authorization")
    const expectedToken = process.env.FILEMAKER_SYNC_TOKEN || "your-secret-token"

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { employees } = body

    if (!employees || !Array.isArray(employees)) {
      return NextResponse.json({ error: "Invalid request: employees array required" }, { status: 400 })
    }

    // Use service role key to bypass RLS
    if (!supabaseConfig.serviceRoleKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required")
    }

    const supabaseAdmin = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get existing employees
    const { data: existingEmployees, error: fetchError } = await supabaseAdmin
      .from("employees")
      .select("id, employee_number")

    if (fetchError) {
      throw fetchError
    }

    const existingEmployeeMap = new Map(existingEmployees?.map((e) => [e.employee_number, e.id]) || [])

    let insertedCount = 0
    let updatedCount = 0
    let skippedCount = 0
    const errors: string[] = []

    // Process each employee from FileMaker
    for (const employee of employees) {
      const { employee_number, name, email, phone, role, status, hourly_rate, pin } = employee

      if (!employee_number) {
        skippedCount++
        continue
      }

      const employeeData = {
        employee_number: String(employee_number),
        name: name || "Unknown",
        email: email || null,
        phone: phone || null,
        role: role || "employee",
        status: status === "Active" ? "active" : "inactive",
        hourly_rate: hourly_rate ? Number.parseFloat(hourly_rate) : null,
        overtime_rate: hourly_rate ? Number.parseFloat(hourly_rate) * 1.5 : null,
      }

      try {
        if (existingEmployeeMap.has(employeeData.employee_number)) {
          // Update existing employee
          const existingId = existingEmployeeMap.get(employeeData.employee_number)

          const { error: updateError } = await supabaseAdmin.from("employees").update(employeeData).eq("id", existingId)

          if (updateError) {
            errors.push(`Failed to update ${employeeData.name}: ${updateError.message}`)
          } else {
            updatedCount++

            // Update PIN if provided
            if (pin && existingId) {
              const { error: pinError } = await supabaseAdmin.rpc("set_employee_pin", {
                p_employee_id: existingId,
                p_pin: pin,
              })

              if (pinError) {
                errors.push(`Failed to update PIN for ${employeeData.name}: ${pinError.message}`)
              }
            }
          }
        } else {
          // Insert new employee
          const { data: insertedEmployee, error: insertError } = await supabaseAdmin
            .from("employees")
            .insert(employeeData)
            .select("id")
            .single()

          if (insertError) {
            errors.push(`Failed to insert ${employeeData.name}: ${insertError.message}`)
          } else {
            insertedCount++

            // Set PIN if provided
            if (pin && insertedEmployee) {
              const { error: pinError } = await supabaseAdmin.rpc("set_employee_pin", {
                p_employee_id: insertedEmployee.id,
                p_pin: pin,
              })

              if (pinError) {
                errors.push(`Failed to set PIN for ${employeeData.name}: ${pinError.message}`)
              }
            }
          }
        }
      } catch (error) {
        errors.push(`Failed to process ${employeeData.name}: ${error}`)
      }
    }

    const result = {
      success: true,
      total: employees.length,
      inserted: insertedCount,
      updated: updatedCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined,
    }

    console.log("[v0] Push sync completed:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] API: Employee push error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
