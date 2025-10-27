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
    console.log("[v0] adminLogin: Layout:", FILEMAKER_LAYOUTS.EMPLOYEES)
    console.log("[v0] adminLogin: Email field name:", EMPLOYEE_FIELDS.EMAIL)
    console.log("[v0] adminLogin: Searching for email:", email)

    const result = await fileMaker.findRecords(FILEMAKER_LAYOUTS.EMPLOYEES, [{ [EMPLOYEE_FIELDS.EMAIL]: email }])

    console.log("[v0] adminLogin: FileMaker raw response:", JSON.stringify(result, null, 2))
    console.log("[v0] adminLogin: Found records count:", result.response.data?.length || 0)
    console.log("[v0] adminLogin: Data info:", result.response.dataInfo)

    if (!result.response.data || result.response.data.length === 0) {
      console.log("[v0] adminLogin: No user found with email:", email)
      try {
        const sampleRecords = await fileMaker.getRecords(FILEMAKER_LAYOUTS.EMPLOYEES, { _limit: 3 })
        console.log("[v0] adminLogin: Sample records from database:")
        sampleRecords.response.data?.forEach((record, index) => {
          console.log(`[v0] adminLogin: Sample ${index + 1}:`, {
            email: record.fieldData[EMPLOYEE_FIELDS.EMAIL],
            name: record.fieldData[EMPLOYEE_FIELDS.NAME_FULL],
            webAdminRole: record.fieldData[EMPLOYEE_FIELDS.WEB_ADMIN_ROLE],
            allFields: Object.keys(record.fieldData),
          })
        })
      } catch (sampleError) {
        console.error("[v0] adminLogin: Could not fetch sample records:", sampleError)
      }
      return { success: false, error: "Invalid credentials" }
    }

    const admin = result.response.data[0].fieldData

    console.log("[v0] adminLogin: Found user:", {
      id: admin[EMPLOYEE_FIELDS.ID],
      name: admin[EMPLOYEE_FIELDS.NAME_FULL],
      email: admin[EMPLOYEE_FIELDS.EMAIL],
      webAdminRole: admin[EMPLOYEE_FIELDS.WEB_ADMIN_ROLE],
      hasPinHash: !!admin[EMPLOYEE_FIELDS.PIN_HASH],
      pinHashValue: admin[EMPLOYEE_FIELDS.PIN_HASH],
      enteredPassword: password,
      allFieldNames: Object.keys(admin),
    })

    const webAdminRole = admin[EMPLOYEE_FIELDS.WEB_ADMIN_ROLE]
    if (webAdminRole !== "admin" && webAdminRole !== "super_admin") {
      console.log("[v0] adminLogin: User does not have admin role. Current role:", webAdminRole)
      return { success: false, error: "Unauthorized: Admin access required. Please contact your administrator." }
    }

    const storedPassword = String(admin[EMPLOYEE_FIELDS.PIN_HASH] || "")
    const enteredPassword = String(password)

    console.log("[v0] adminLogin: Password comparison:", {
      stored: storedPassword,
      entered: enteredPassword,
      match: storedPassword === enteredPassword,
      storedLength: storedPassword.length,
      enteredLength: enteredPassword.length,
      storedType: typeof storedPassword,
      enteredType: typeof enteredPassword,
    })

    if (storedPassword !== enteredPassword) {
      console.log("[v0] adminLogin: Password mismatch")
      return { success: false, error: "Invalid credentials" }
    }

    console.log("[v0] adminLogin: Login successful for:", admin[EMPLOYEE_FIELDS.NAME_FULL])

    const cookieStore = await cookies()
    cookieStore.set(
      "admin_session",
      JSON.stringify({
        id: admin[EMPLOYEE_FIELDS.ID],
        email: admin[EMPLOYEE_FIELDS.EMAIL] || "",
        name: admin[EMPLOYEE_FIELDS.NAME_FULL],
        role: webAdminRole,
        loginNumber: admin[EMPLOYEE_FIELDS.EMPLOYEE_LOGIN_NUMBER],
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
        path: "/", // Ensure cookie is available on all routes
      },
    )

    return {
      success: true,
      user: {
        id: admin[EMPLOYEE_FIELDS.ID],
        email: admin[EMPLOYEE_FIELDS.EMAIL] || admin[EMPLOYEE_FIELDS.NAME_FULL],
        role: webAdminRole,
      },
    }
  } catch (error) {
    console.error("[v0] Admin login error:", error)
    if (error instanceof Error) {
      console.error("[v0] Admin login error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
    }
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Admin login alternative that searches by multiple fields
export async function adminLoginAlternative(email: string, password: string): Promise<AuthResult> {
  try {
    console.log("[v0] adminLoginAlt: Starting alternative login for:", email)

    // First, try to get all records and find the user manually
    const allStaff = await fileMaker.getRecords(FILEMAKER_LAYOUTS.EMPLOYEES, { _limit: 100 })

    console.log("[v0] adminLoginAlt: Retrieved", allStaff.response.data?.length, "staff records")

    // Find the user by email (case-insensitive, trimmed)
    const normalizedEmail = email.toLowerCase().trim()
    const matchingRecord = allStaff.response.data?.find((record) => {
      const recordEmail = String(record.fieldData[EMPLOYEE_FIELDS.EMAIL] || "")
        .toLowerCase()
        .trim()
      return recordEmail === normalizedEmail
    })

    if (!matchingRecord) {
      console.log("[v0] adminLoginAlt: No user found with email:", email)
      console.log(
        "[v0] adminLoginAlt: Available emails:",
        allStaff.response.data?.map((r) => r.fieldData[EMPLOYEE_FIELDS.EMAIL]).filter(Boolean),
      )
      return { success: false, error: "Invalid credentials" }
    }

    const admin = matchingRecord.fieldData

    console.log("[v0] adminLoginAlt: Found user:", {
      id: admin[EMPLOYEE_FIELDS.ID],
      name: admin[EMPLOYEE_FIELDS.NAME_FULL],
      email: admin[EMPLOYEE_FIELDS.EMAIL],
      webAdminRole: admin[EMPLOYEE_FIELDS.WEB_ADMIN_ROLE],
      pinHash: admin[EMPLOYEE_FIELDS.PIN_HASH],
    })

    const webAdminRole = admin[EMPLOYEE_FIELDS.WEB_ADMIN_ROLE]
    if (webAdminRole !== "admin" && webAdminRole !== "super_admin") {
      console.log("[v0] adminLoginAlt: User does not have admin role. Current role:", webAdminRole)
      return { success: false, error: "Unauthorized: Admin access required" }
    }

    const storedPassword = String(admin[EMPLOYEE_FIELDS.PIN_HASH] || "")
    const enteredPassword = String(password)

    console.log("[v0] adminLoginAlt: Password comparison:", {
      stored: storedPassword,
      entered: enteredPassword,
      match: storedPassword === enteredPassword,
    })

    if (storedPassword !== enteredPassword) {
      console.log("[v0] adminLoginAlt: Password mismatch")
      return { success: false, error: "Invalid credentials" }
    }

    console.log("[v0] adminLoginAlt: Login successful")

    const cookieStore = await cookies()
    cookieStore.set(
      "admin_session",
      JSON.stringify({
        id: admin[EMPLOYEE_FIELDS.ID],
        email: admin[EMPLOYEE_FIELDS.EMAIL] || "",
        name: admin[EMPLOYEE_FIELDS.NAME_FULL],
        role: webAdminRole,
        loginNumber: admin[EMPLOYEE_FIELDS.EMPLOYEE_LOGIN_NUMBER],
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
        path: "/", // Ensure cookie is available on all routes
      },
    )

    return {
      success: true,
      user: {
        id: admin[EMPLOYEE_FIELDS.ID],
        email: admin[EMPLOYEE_FIELDS.EMAIL] || admin[EMPLOYEE_FIELDS.NAME_FULL],
        role: webAdminRole,
      },
    }
  } catch (error) {
    console.error("[v0] adminLoginAlt error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Admin login using Login Number instead of Email field
export async function adminLoginByLoginNumber(loginNumber: string, password: string): Promise<AuthResult> {
  try {
    console.log("[v0] adminLoginByLoginNumber: Starting login for:", loginNumber)
    console.log("[v0] adminLoginByLoginNumber: Layout:", FILEMAKER_LAYOUTS.EMPLOYEES)
    console.log("[v0] adminLoginByLoginNumber: Login Number field:", EMPLOYEE_FIELDS.EMPLOYEE_LOGIN_NUMBER)

    const result = await fileMaker.findRecords(FILEMAKER_LAYOUTS.EMPLOYEES, [
      { [EMPLOYEE_FIELDS.EMPLOYEE_LOGIN_NUMBER]: loginNumber },
    ])

    console.log("[v0] adminLoginByLoginNumber: Found records count:", result.response.data?.length || 0)

    if (!result.response.data || result.response.data.length === 0) {
      console.log("[v0] adminLoginByLoginNumber: No user found with login number:", loginNumber)
      return { success: false, error: "Invalid credentials" }
    }

    const admin = result.response.data[0].fieldData

    console.log("[v0] adminLoginByLoginNumber: Found user:", {
      id: admin[EMPLOYEE_FIELDS.ID],
      name: admin[EMPLOYEE_FIELDS.NAME_FULL],
      loginNumber: admin[EMPLOYEE_FIELDS.EMPLOYEE_LOGIN_NUMBER],
      webAdminRole: admin[EMPLOYEE_FIELDS.WEB_ADMIN_ROLE],
      pinHash: admin[EMPLOYEE_FIELDS.PIN_HASH],
    })

    const webAdminRole = admin[EMPLOYEE_FIELDS.WEB_ADMIN_ROLE]
    if (webAdminRole !== "admin" && webAdminRole !== "super_admin") {
      console.log("[v0] adminLoginByLoginNumber: User does not have admin role. Current role:", webAdminRole)
      return { success: false, error: "Unauthorized: Admin access required" }
    }

    const storedPassword = String(admin[EMPLOYEE_FIELDS.PIN_HASH] || "")
    const enteredPassword = String(password)

    console.log("[v0] adminLoginByLoginNumber: Password comparison:", {
      stored: storedPassword,
      entered: enteredPassword,
      match: storedPassword === enteredPassword,
    })

    if (storedPassword !== enteredPassword) {
      console.log("[v0] adminLoginByLoginNumber: Password mismatch")
      return { success: false, error: "Invalid credentials" }
    }

    console.log("[v0] adminLoginByLoginNumber: Login successful")

    const cookieStore = await cookies()
    cookieStore.set(
      "admin_session",
      JSON.stringify({
        id: admin[EMPLOYEE_FIELDS.ID],
        email: admin[EMPLOYEE_FIELDS.EMAIL] || "",
        name: admin[EMPLOYEE_FIELDS.NAME_FULL],
        role: webAdminRole,
        loginNumber: admin[EMPLOYEE_FIELDS.EMPLOYEE_LOGIN_NUMBER],
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
        path: "/", // Ensure cookie is available on all routes
      },
    )

    return {
      success: true,
      user: {
        id: admin[EMPLOYEE_FIELDS.ID],
        email: admin[EMPLOYEE_FIELDS.EMAIL] || admin[EMPLOYEE_FIELDS.NAME_FULL],
        role: webAdminRole,
      },
    }
  } catch (error) {
    console.error("[v0] adminLoginByLoginNumber error:", error)
    if (error instanceof Error) {
      console.error("[v0] Error details:", {
        message: error.message,
        stack: error.stack,
      })
    }
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
    console.log("[v0] changeEmployeePIN: Starting PIN change for employee:", employeeId)
    console.log("[v0] changeEmployeePIN: New PIN length:", newPIN.length)

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

    console.log("[v0] changeEmployeePIN: Finding employee record with ID:", employeeId)
    const result = await fileMaker.findRecords(FILEMAKER_LAYOUTS.EMPLOYEES, [{ [EMPLOYEE_FIELDS.ID]: employeeId }])

    if (!result.response.data || result.response.data.length === 0) {
      console.error("[v0] changeEmployeePIN: Employee not found with ID:", employeeId)
      return { success: false, error: "Employee not found" }
    }

    const recordId = result.response.data[0].recordId
    console.log("[v0] changeEmployeePIN: Found FileMaker recordId:", recordId)

    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const year = now.getFullYear()
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    const seconds = String(now.getSeconds()).padStart(2, "0")
    const fileMakerDate = `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`

    console.log("[v0] changeEmployeePIN: Updating record with new PIN and date:", fileMakerDate)
    const updateResult = await fileMaker.updateRecord(FILEMAKER_LAYOUTS.EMPLOYEES, recordId, {
      [EMPLOYEE_FIELDS.PIN_HASH]: newPIN,
      [EMPLOYEE_FIELDS.MUST_CHANGE_PIN]: "0",
      [EMPLOYEE_FIELDS.PIN_CHANGED]: "1",
      [EMPLOYEE_FIELDS.PIN_LAST_CHANGED]: fileMakerDate,
    })

    console.log("[v0] changeEmployeePIN: Update successful:", updateResult)
    return { success: true }
  } catch (error) {
    console.error("[v0] Change PIN error:", error)
    if (error instanceof Error) {
      console.error("[v0] Change PIN error details:", {
        message: error.message,
        stack: error.stack,
      })
    }
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
