// IndexedDB wrapper for offline time entry storage

const DB_NAME = "SandGTimeClockDB"
const DB_VERSION = 1
const STORE_NAME = "pending_entries"

export interface PendingTimeEntry {
  id: string
  employeeId: string
  employeeName: string
  projectId?: string
  projectName?: string
  actionType: "clock_in" | "clock_out"
  timestamp: string // ISO 8601 format
  latitude: number
  longitude: number
  accuracy: number
  status: "pending" | "syncing" | "synced" | "failed"
  timeEntryId?: string // FileMaker record ID (for clock out)
  error?: string
  retryCount: number
  createdAt: string
}

class OfflineDB {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error("[OfflineDB] Failed to open database:", request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log("[OfflineDB] Database opened successfully")
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" })
          store.createIndex("status", "status", { unique: false })
          store.createIndex("employeeId", "employeeId", { unique: false })
          store.createIndex("timestamp", "timestamp", { unique: false })
          console.log("[OfflineDB] Object store created")
        }
      }
    })
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init()
    }
    return this.db!
  }

  async addPendingEntry(entry: PendingTimeEntry): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      const store = tx.objectStore(STORE_NAME)
      const request = store.add(entry)

      request.onsuccess = () => {
        console.log("[OfflineDB] Added pending entry:", entry.id)
        resolve()
      }

      request.onerror = () => {
        console.error("[OfflineDB] Failed to add entry:", request.error)
        reject(request.error)
      }
    })
  }

  async getPendingEntries(): Promise<PendingTimeEntry[]> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const store = tx.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        const entries = request.result as PendingTimeEntry[]
        console.log("[OfflineDB] Retrieved pending entries:", entries.length)
        resolve(entries)
      }

      request.onerror = () => {
        console.error("[OfflineDB] Failed to get entries:", request.error)
        reject(request.error)
      }
    })
  }

  async getPendingEntriesByStatus(status: PendingTimeEntry["status"]): Promise<PendingTimeEntry[]> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const store = tx.objectStore(STORE_NAME)
      const index = store.index("status")
      const request = index.getAll(status)

      request.onsuccess = () => {
        resolve(request.result as PendingTimeEntry[])
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  async updateEntry(id: string, updates: Partial<PendingTimeEntry>): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      const store = tx.objectStore(STORE_NAME)
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const entry = getRequest.result
        if (!entry) {
          reject(new Error("Entry not found"))
          return
        }

        const updatedEntry = { ...entry, ...updates }
        const putRequest = store.put(updatedEntry)

        putRequest.onsuccess = () => {
          console.log("[OfflineDB] Updated entry:", id)
          resolve()
        }

        putRequest.onerror = () => {
          reject(putRequest.error)
        }
      }

      getRequest.onerror = () => {
        reject(getRequest.error)
      }
    })
  }

  async deleteEntry(id: string): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      const store = tx.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => {
        console.log("[OfflineDB] Deleted entry:", id)
        resolve()
      }

      request.onerror = () => {
        console.error("[OfflineDB] Failed to delete entry:", request.error)
        reject(request.error)
      }
    })
  }

  async clearAllEntries(): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      const store = tx.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => {
        console.log("[OfflineDB] Cleared all entries")
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  async getEntryCount(): Promise<number> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const store = tx.objectStore(STORE_NAME)
      const request = store.count()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }
}

export const offlineDB = new OfflineDB()
