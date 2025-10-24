"use server"

import { fileMaker } from "@/lib/filemaker/client"
import { FILEMAKER_LAYOUTS, EMPLOYEE_FIELDS } from "@/lib/filemaker/config"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

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

function hashPIN(pin: string): string {
  // For now, return plain PIN since FileMaker stores plain text
  // In production, you should use bcrypt or similar
  return pin
}

export async function employeeLogin(employeeNumber: string, pin: string): Promise<AuthResult> {
  try {
    console.log("[v0] employeeLogin: Starting login for employee:", employeeNumber)

    const result = await fileMaker.findRecords(FILEMAKER_LAYOUTS.EMPLOYEES, [
      { [EMPLOYEE_FIELDS.EMPLOYEE_LOGIN_NUMBER]: employeeNumber },
    ])

    console.log("[v0] employeeLogin: FileMaker search result:", {
      found: result.response.data?.length || 0,
      dataLength: result.response.dataInfo?.foundCount,
    })

    if (!result.response.data || result.response.data.length === 0) {
      console.log("[v0] employeeLogin: No employee found with number:", employeeNumber)
      return { success: false, error: "Invalid employee number or PIN" }
    }

    const employee = result.response.data[0].fieldData
    console.log("[v0] employeeLogin: Found employee:", {
      id: employee[EMPLOYEE_FIELDS.ID],
      name: employee[EMPLOYEE_FIELDS.NAME_FULL],
      hasPin: !!employee[EMPLOYEE_FIELDS.PIN_HASH],
    })

    const storedPin = employee[EMPLOYEE_FIELDS.PIN_HASH]
    if (storedPin !== pin) {
      console.log("[v0] employeeLogin: PIN mismatch")
      return { success: false, error: "Invalid employee number or PIN" }
    }

    console.log("[v0] employeeLogin: Login successful")

    const cookieStore = await cookies()
    cookieStore.set(
      "employee_session",
      JSON.stringify({
        id: employee[EMPLOYEE_FIELDS.ID],
        name: employee[EMPLOYEE_FIELDS.NAME_FULL],
        employeeNumber: employee[EMPLOYEE_FIELDS.EMPLOYEE_LOGIN_NUMBER],
        role: employee[EMPLOYEE_FIELDS.CATEGORY] || "employee",
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 24 hours
        sameSite: "lax",
      },
    )

    return {
      success: true,
      user: {
        id: employee[EMPLOYEE_FIELDS.ID],
        email: employee[EMPLOYEE_FIELDS.NAME_FULL],
        role: employee[EMPLOYEE_FIELDS.CATEGORY] || "employee",
      },
      mustChangePIN:
        employee[EMPLOYEE_FIELDS.MUST_CHANGE_PIN] === "1" || employee[EMPLOYEE_FIELDS.MUST_CHANGE_PIN] === 1,
    }
  } catch (error) {
    console.error("[v0] Employee login error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Admin login with email and password
export async function adminLogin(email: string, password: string): Promise<AuthResult> {
  try {
    console.log("[v0] adminLogin: Starting login for:", email)

    const result = await fileMaker.findRecords(FILEMAKER_LAYOUTS.EMPLOYEES, [{ [EMPLOYEE_FIELDS.EMAIL]: email }])

    if (!result.response.data || result.response.data.length === 0) {
      return { success: false, error: "Invalid credentials" }
    }

    const admin = result.response.data[0].fieldData

    const webAdminRole = admin[EMPLOYEE_FIELDS.WEB_ADMIN_ROLE]
    if (webAdminRole !== "admin" && webAdminRole !== "super_admin") {
      return { success: false, error: "Unauthorized: Admin access required" }
    }

    if (admin[EMPLOYEE_FIELDS.PIN_HASH] !== password) {
      return { success: false, error: "Invalid credentials" }
    }

    const cookieStore = await cookies()
    cookieStore.set(
      "admin_session",
      JSON.stringify({
        id: admin[EMPLOYEE_FIELDS.ID],
        email: admin[EMPLOYEE_FIELDS.EMAIL],
        name: admin[EMPLOYEE_FIELDS.NAME_FULL],
        role: webAdminRole,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
      },
    )

    return {
      success: true,
      user: {
        id: admin[EMPLOYEE_FIELDS.ID],
        email: admin[EMPLOYEE_FIELDS.EMAIL],
        role: webAdminRole,
      },
    }
  } catch (error) {
    console.error("[v0] Admin login error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Get current employee from session
export async function getCurrentEmployee() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("employee_session")

    if (!sessionCookie) {
      return null
    }

    const session = JSON.parse(sessionCookie.value)
    return session
  } catch (error) {
    console.error("[v0] Get current employee error:", error)
    return null
  }
}

// Get current admin user
export async function getCurrentAdmin() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("admin_session")

    if (!sessionCookie) {
      return null
    }

    const session = JSON.parse(sessionCookie.value)
    return session
  } catch (error) {
    console.error("[v0] Get current admin error:", error)
    return null
  }
}

// Employee logout
export async function employeeLogout() {
  const cookieStore = await cookies()
  cookieStore.delete("employee_session")
  redirect("/employee/login")
}

// Admin logout
export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  redirect("/admin/login")
}

// Change employee PIN
export async function changeEmployeePIN(employeeId: string, newPIN: string, confirmPIN: string): Promise<AuthResult> {
  try {
    if (newPIN !== confirmPIN) {
      return { success: false, error: "PINs do not match" }
    }

    if (!/^\d{4,6}$/.test(newPIN)) {
      return { success: false, error: "PIN must be 4-6 digits" }
    }

    await fileMaker.updateRecord(FILEMAKER_LAYOUTS.EMPLOYEES, employeeId, {
      [EMPLOYEE_FIELDS.PIN_HASH]: newPIN,
      [EMPLOYEE_FIELDS.MUST_CHANGE_PIN]: "0",
    })

    return { success: true }
  } catch (error) {
    console.error("[v0] Change PIN error:", error)
    return { success: false, error: "Failed to change PIN" }
  }
}

// Admin reset employee PIN
export async function adminResetEmployeePIN(employeeId: string, newPIN: string): Promise<AuthResult> {
  try {
    if (!/^\d{4,6}$/.test(newPIN)) {
      return { success: false, error: "PIN must be 4-6 digits" }
    }

    await fileMaker.updateRecord(FILEMAKER_LAYOUTS.EMPLOYEES, employeeId, {
      [EMPLOYEE_FIELDS.PIN_HASH]: newPIN,
      [EMPLOYEE_FIELDS.MUST_CHANGE_PIN]: "1",
      [EMPLOYEE_FIELDS.FAILED_LOGIN_ATTEMPTS]: "0",
    })

    return { success: true }
  } catch (error) {
    console.error("[v0] Admin reset PIN error:", error)
    return { success: false, error: "Failed to reset PIN" }
  }
}
