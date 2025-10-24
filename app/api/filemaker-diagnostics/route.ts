import { NextResponse } from "next/server"

export async function GET() {
  console.log("[v0] FileMaker Diagnostics Starting...")

  const config = {
    serverUrl: process.env.FILEMAKER_SERVER_URL,
    database: process.env.FILEMAKER_DATABASE,
    username: process.env.FILEMAKER_USERNAME,
    hasPassword: !!process.env.FILEMAKER_PASSWORD,
  }

  console.log("[v0] Configuration:", config)

  // Test 1: Check if all variables are set
  const missingVars = []
  if (!config.serverUrl) missingVars.push("FILEMAKER_SERVER_URL")
  if (!config.database) missingVars.push("FILEMAKER_DATABASE")
  if (!config.username) missingVars.push("FILEMAKER_USERNAME")
  if (!config.hasPassword) missingVars.push("FILEMAKER_PASSWORD")

  if (missingVars.length > 0) {
    return NextResponse.json({
      success: false,
      step: "configuration",
      error: `Missing environment variables: ${missingVars.join(", ")}`,
      details: config,
    })
  }

  // Test 2: Construct the authentication URL
  const authUrl = `${config.serverUrl}/fmi/data/v1/databases/${config.database}/sessions`
  console.log("[v0] Auth URL:", authUrl)

  // Test 3: Try to authenticate
  try {
    const authString = Buffer.from(`${config.username}:${process.env.FILEMAKER_PASSWORD}`).toString("base64")

    console.log("[v0] Attempting authentication...")

    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify({}),
    })

    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response ok:", response.ok)
    console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

    const contentType = response.headers.get("content-type")
    console.log("[v0] Content-Type:", contentType)

    // Get the raw response text first
    const responseText = await response.text()
    console.log("[v0] Raw response (first 500 chars):", responseText.substring(0, 500))

    // Try to parse as JSON
    let responseData
    try {
      responseData = JSON.parse(responseText)
      console.log("[v0] Parsed JSON successfully:", responseData)
    } catch (parseError) {
      console.error("[v0] Failed to parse as JSON:", parseError)
      return NextResponse.json({
        success: false,
        step: "authentication",
        error:
          'FileMaker returned invalid JSON. Response: <!DOCTYPE html><html class="font-sans antialiased geistmono_157ca88a-module__GCDpBW__variable geistmono_157ca88a-module__COSDeW__variable" style="--font-serif:__fallback_lang=\'en\'><head><meta charset',
        details: {
          serverUrl: config.serverUrl,
          database: config.database,
          username: config.username,
          hasPassword: true,
          authUrl,
          responseStatus: response.status,
          contentType,
          responsePreview: responseText.substring(0, 200),
        },
      })
    }

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        step: "authentication",
        error: `Authentication failed with status ${response.status}`,
        details: {
          ...config,
          authUrl,
          responseStatus: response.status,
          responseData,
        },
      })
    }

    // Test 4: Try to read from a layout
    const token = responseData.response.token
    console.log("[v0] Got token:", token)

    const layoutUrl = `${config.serverUrl}/fmi/data/v1/databases/${config.database}/layouts/T17z_TimeEntries/records?_limit=1`
    console.log("[v0] Testing read from layout:", layoutUrl)

    const readResponse = await fetch(layoutUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const readData = await readResponse.json()
    console.log("[v0] Read response:", readData)

    return NextResponse.json({
      success: true,
      message: "FileMaker connection successful!",
      details: {
        serverUrl: config.serverUrl,
        database: config.database,
        username: config.username,
        authUrl,
        layoutUrl,
        canAuthenticate: true,
        canReadLayout: readResponse.ok,
        recordCount: readData.response?.dataInfo?.foundCount,
      },
    })
  } catch (error) {
    console.error("[v0] Error during diagnostics:", error)
    return NextResponse.json({
      success: false,
      step: "connection",
      error: error instanceof Error ? error.message : "Unknown error",
      details: config,
    })
  }
}
