// FileMaker Data API client
export class FileMakerClient {
  private baseUrl: string
  private database: string
  private username: string
  private password: string
  private token: string | null = null

  constructor() {
    this.baseUrl = process.env.FILEMAKER_SERVER_URL || ""
    this.database = process.env.FILEMAKER_DATABASE || ""
    this.username = process.env.FILEMAKER_USERNAME || ""
    this.password = process.env.FILEMAKER_PASSWORD || ""
  }

  private clearToken() {
    this.token = null
  }

  // Get authentication token
  private async getToken(): Promise<string> {
    if (this.token) return this.token

    console.log("[v0] FileMaker auth - Base URL:", this.baseUrl)
    console.log("[v0] FileMaker auth - Database:", this.database)
    console.log("[v0] FileMaker auth - Username:", this.username)
    console.log("[v0] FileMaker auth - Password length:", this.password?.length || 0)

    const authUrl = `${this.baseUrl}/fmi/data/v1/databases/${this.database}/sessions`
    console.log("[v0] FileMaker auth URL:", authUrl)

    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${this.username}:${this.password}`).toString("base64")}`,
      },
    })

    console.log("[v0] FileMaker auth response status:", response.status)
    console.log("[v0] FileMaker auth response ok:", response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] FileMaker auth failed:", errorText)
      throw new Error(`Failed to authenticate with FileMaker: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] FileMaker auth successful, token received")
    this.token = data.response.token
    return this.token
  }

  private async makeAuthenticatedRequest(url: string, options: RequestInit, retryCount = 0): Promise<Response> {
    const token = await this.getToken()

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    })

    // If we get a 401 and haven't retried yet, clear token and retry
    if (response.status === 401 && retryCount === 0) {
      console.log("[v0] Got 401, clearing token and retrying...")
      this.clearToken()
      return this.makeAuthenticatedRequest(url, options, retryCount + 1)
    }

    return response
  }

  // Find records
  async findRecords(layout: string, query?: any) {
    const response = await this.makeAuthenticatedRequest(
      `${this.baseUrl}/fmi/data/v1/databases/${this.database}/layouts/${layout}/_find`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query || [{}] }),
      },
    )

    if (!response.ok) {
      throw new Error("Failed to find records")
    }

    return response.json()
  }

  // Get all records
  async getRecords(layout: string, limit = 100) {
    const response = await this.makeAuthenticatedRequest(
      `${this.baseUrl}/fmi/data/v1/databases/${this.database}/layouts/${layout}/records?_limit=${limit}`,
      {
        method: "GET",
      },
    )

    if (!response.ok) {
      throw new Error("Failed to get records")
    }

    return response.json()
  }

  async getAllRecords(layout: string, limit = 100) {
    console.log("[v0] FileMaker getAllRecords called for layout:", layout)
    try {
      const result = await this.getRecords(layout, limit)
      console.log("[v0] FileMaker getAllRecords result:", JSON.stringify(result, null, 2))
      return result
    } catch (error) {
      console.error("[v0] FileMaker getAllRecords error:", error)
      throw error
    }
  }

  // Create record
  async createRecord(layout: string, fieldData: any) {
    console.log("[v0] FileMaker createRecord called")
    console.log("[v0] Layout:", layout)
    console.log("[v0] Field data:", JSON.stringify(fieldData, null, 2))

    const url = `${this.baseUrl}/fmi/data/v1/databases/${this.database}/layouts/${layout}/records`
    console.log("[v0] Create record URL:", url)

    const body = JSON.stringify({ fieldData })
    console.log("[v0] Request body:", body)

    const response = await this.makeAuthenticatedRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    })

    console.log("[v0] Create record response status:", response.status)
    console.log("[v0] Create record response ok:", response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] FileMaker create record failed:", errorText)
      throw new Error(`Failed to create record: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("[v0] Create record result:", JSON.stringify(result, null, 2))
    return result
  }

  // Update record
  async updateRecord(layout: string, recordId: string, fieldData: any) {
    const response = await this.makeAuthenticatedRequest(
      `${this.baseUrl}/fmi/data/v1/databases/${this.database}/layouts/${layout}/records/${recordId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fieldData }),
      },
    )

    if (!response.ok) {
      throw new Error("Failed to update record")
    }

    return response.json()
  }

  // Delete record
  async deleteRecord(layout: string, recordId: string) {
    const response = await this.makeAuthenticatedRequest(
      `${this.baseUrl}/fmi/data/v1/databases/${this.database}/layouts/${layout}/records/${recordId}`,
      {
        method: "DELETE",
      },
    )

    if (!response.ok) {
      throw new Error("Failed to delete record")
    }

    return response.json()
  }

  // Logout
  async logout() {
    if (!this.token) return

    const token = this.token
    this.token = null

    await fetch(`${this.baseUrl}/fmi/data/v1/databases/${this.database}/sessions/${token}`, {
      method: "DELETE",
    })
  }
}

export const fileMaker = new FileMakerClient()
