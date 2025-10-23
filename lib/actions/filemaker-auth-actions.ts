"use server"

import { fileMaker } from "@/lib/filemaker/client"
import { cookies } from "next/headers"

export async function adminLoginFileMaker(email: string, password: string) {
  try {
    // Find admin user by email
    const result = await fileMaker.findRecords("AdminUsers", [{ email: email }])

    if (!result.response.data || result.response.data.length === 0) {
      return { success: false, error: "Invalid credentials" }
    }

    const admin = result.response.data[0].fieldData

    // Verify password (you'll need to implement password hashing in FileMaker)
    // For now, assuming FileMaker handles authentication
    if (admin.password !== password) {
      return { success: false, error: "Invalid credentials" }
    }

    // Set session cookie
    cookies().set(
      "admin_session",
      JSON.stringify({
        id: admin.id,
        email: admin.email,
        name: admin.name,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    )

    return { success: true }
  } catch (error) {
    console.error("Admin login error:", error)
    return { success: false, error: "Login failed" }
  }
}

export async function employeeLoginFileMaker(employeeNumber: string, pin: string) {
  try {
    // Find employee by employee number
    const result = await fileMaker.findRecords("Employees", [{ employee_number: employeeNumber }])

    if (!result.response.data || result.response.data.length === 0) {
      return { success: false, error: "Invalid credentials" }
    }

    const employee = result.response.data[0].fieldData

    // Verify PIN
    if (employee.pin !== pin) {
      return { success: false, error: "Invalid PIN" }
    }

    return {
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
        employee_number: employee.employee_number,
        role: employee.role,
      },
    }
  } catch (error) {
    console.error("Employee login error:", error)
    return { success: false, error: "Login failed" }
  }
}
