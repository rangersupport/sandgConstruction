"use server"

import { fileMaker } from "@/lib/filemaker/client"
import { FILEMAKER_LAYOUTS, EMPLOYEE_FIELDS } from "@/lib/filemaker/config"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

const DEFAULT_PIN = "1234"

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

function isWeakPIN(pin: string): boolean {
  // Check if all digits are the same (1111, 2222, etc.)
  if (/^(\d)\1+$/.test(pin)) {
    return true
  }

  // Check if sequential ascending (1234, 2345, etc.)
  const digits = pin.split("").map(Number)
  let isAscending = true
  let isDescending = true

  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== digits[i - 1] + 1) {
      isAscending = false
    }
    if (digits[i] !== digits[i - 1] - 1) {
      isDescending = false
    }
  }

  return isAscending || isDescending
}

export async function employeeLogin(employeeNumber: string, pin: string): Promise<AuthResult> {
  try {
    console.log("[v0] employeeLogin: Starting login for employee:", employeeNumber)
    console.log("[v0] employeeLogin: Searching in layout:", FILEMAKER_LAYOUTS.EMPLOYEES)
    console.log("[v0] employeeLogin: Using field:", EMPLOYEE_FIELDS.EMPLOYEE_LOGIN_NUMBER)

    const result = await fileMaker.findRecords(FILEMAKER_LAYOUTS.EMPLOYEES, [
      { [EMPLOYEE_FIELDS.EMPLOYEE_LOGIN_NUMBER]: employeeNumber },
    ])

    console.log("[v0] employeeLogin: FileMaker search result:", {
      found: result.response.data?.length || 0,
      dataLength: result.response.dataInfo?.foundCount,
      rawData: result.response.data?.[0]?.fieldData,
    })

    if (!result.response.data || result.response.data.length === 0) {
      console.log("[v0] employeeLogin: No employee found with number:", employeeNumber)
      try {
        const allEmployees = await fileMaker.getRecords(FILEMAKER_LAYOUTS.EMPLOYEES, { _limit: 5 })
        console.log(
          "[v0] employeeLogin: Sample employees in database:",
          allEmployees.response.data?.map((e) => ({
            loginNumber: e.fieldData[EMPLOYEE_FIELDS.EMPLOYEE_LOGIN_NUMBER],
            name: e.fieldData[EMPLOYEE_FIELDS.NAME_FULL],
          })),
        )
      } catch (e) {
        console.log("[v0] employeeLogin: Could not fetch sample employees:", e)
      }
      return { success: false, error: "Invalid employee number or PIN" }
    }

    const employee = result.response.data[0].fieldData
    console.log("[v0] employeeLogin: Found employee:", {
      id: employee[EMPLOYEE_FIELDS.ID],
      name: employee[EMPLOYEE_FIELDS.NAME_FULL],
      loginNumber: employee[EMPLOYEE_FIELDS.EMPLOYEE_LOGIN_NUMBER],
      hasPin: !!employee[EMPLOYEE_FIELDS.PIN_HASH],
      pinValue: employee[EMPLOYEE_FIELDS.PIN_HASH],
      mustChangePin: employee[EMPLOYEE_FIELDS.MUST_CHANGE_PIN],
    })

    const storedPin = String(employee[EMPLOYEE_FIELDS.PIN_HASH] || "")
    const isFirstLogin = !storedPin || storedPin === "" || storedPin === DEFAULT_PIN

    console.log("[v0] employeeLogin: PIN validation:", {
      isFirstLogin,
      storedPin,
      enteredPin: pin,
      defaultPin: DEFAULT_PIN,
    })

    if (isFirstLogin) {
      // First login: validate against default PIN
      if (pin !== DEFAULT_PIN) {
        console.log("[v0] employeeLogin: Default PIN mismatch")
        return { success: false, error: "Invalid employee number or PIN" }
      }
    } else {
      // Regular login: validate against stored PIN
      if (storedPin !== pin) {
        console.log("[v0] employeeLogin: PIN mismatch")
        return { success: false, error: "Invalid employee number or PIN" }
      }
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

    const mustChangePIN =
      isFirstLogin ||
      employee[EMPLOYEE_FIELDS.MUST_CHANGE_PIN] === "1" ||
      employee[EMPLOYEE_FIELDS.MUST_CHANGE_PIN] === 1

    return {
      success: true,
      user: {
        id: employee[EMPLOYEE_FIELDS.ID],
        email: employee[EMPLOYEE_FIELDS.NAME_FULL],
        role: employee[EMPLOYEE_FIELDS.CATEGORY] || "employee",
      },
      mustChangePIN,
    }
  } catch (error) {
    console.error("[v0] Employee login error:", error)
    if (error instanceof Error) {
      console.error("[v0] Error details:", {
        message: error.message,
        stack: error.stack,
      })
    }
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

    if (isWeakPIN(newPIN)) {
      return {
        success: false,
        error: "PIN is too weak. Avoid repeating digits (1111) or sequential numbers (1234)",
      }
    }

    const now = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })

    await fileMaker.updateRecord(FILEMAKER_LAYOUTS.EMPLOYEES, employeeId, {
      [EMPLOYEE_FIELDS.PIN_HASH]: newPIN,
      [EMPLOYEE_FIELDS.MUST_CHANGE_PIN]: "0",
      [EMPLOYEE_FIELDS.PIN_CHANGED]: "1",
      [EMPLOYEE_FIELDS.PIN_LAST_CHANGED]: now,
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
