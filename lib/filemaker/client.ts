"use server"

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

  // Get authentication token
  private async getToken(): Promise<string> {
    if (this.token) return this.token

    const response = await fetch(`${this.baseUrl}/fmi/data/v1/databases/${this.database}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${this.username}:${this.password}`).toString("base64")}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to authenticate with FileMaker")
    }

    const data = await response.json()
    this.token = data.response.token
    return this.token
  }

  // Find records
  async findRecords(layout: string, query?: any) {
    const token = await this.getToken()

    const response = await fetch(`${this.baseUrl}/fmi/data/v1/databases/${this.database}/layouts/${layout}/_find`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: query || [{}] }),
    })

    if (!response.ok) {
      throw new Error("Failed to find records")
    }

    return response.json()
  }

  // Get all records
  async getRecords(layout: string, limit = 100) {
    const token = await this.getToken()

    const response = await fetch(
      `${this.baseUrl}/fmi/data/v1/databases/${this.database}/layouts/${layout}/records?_limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to get records")
    }

    return response.json()
  }

  // Create record
  async createRecord(layout: string, fieldData: any) {
    const token = await this.getToken()

    const response = await fetch(`${this.baseUrl}/fmi/data/v1/databases/${this.database}/layouts/${layout}/records`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fieldData }),
    })

    if (!response.ok) {
      throw new Error("Failed to create record")
    }

    return response.json()
  }

  // Update record
  async updateRecord(layout: string, recordId: string, fieldData: any) {
    const token = await this.getToken()

    const response = await fetch(
      `${this.baseUrl}/fmi/data/v1/databases/${this.database}/layouts/${layout}/records/${recordId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    const token = await this.getToken()

    const response = await fetch(
      `${this.baseUrl}/fmi/data/v1/databases/${this.database}/layouts/${layout}/records/${recordId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
