"use client"

import { offlineDB } from "./db"
import { clockIn, clockOut } from "@/lib/actions/time-entry-actions"

export class SyncManager {
  private isSyncing = false
  private syncCallbacks: Array<(status: SyncStatus) => void> = []

  onSyncStatusChange(callback: (status: SyncStatus) => void) {
    this.syncCallbacks.push(callback)
    return () => {
      this.syncCallbacks = this.syncCallbacks.filter((cb) => cb !== callback)
    }
  }

  private notifyStatusChange(status: SyncStatus) {
    this.syncCallbacks.forEach((cb) => cb(status))
  }

  async syncPendingEntries(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log("[SyncManager] Sync already in progress")
      return { success: false, synced: 0, failed: 0, message: "Sync already in progress" }
    }

    this.isSyncing = true
    this.notifyStatusChange({ isSyncing: true, progress: 0, total: 0 })

    try {
      const pendingEntries = await offlineDB.getPendingEntriesByStatus("pending")
      console.log("[SyncManager] Found pending entries:", pendingEntries.length)

      if (pendingEntries.length === 0) {
        this.isSyncing = false
        this.notifyStatusChange({ isSyncing: false, progress: 0, total: 0 })
        return { success: true, synced: 0, failed: 0, message: "No entries to sync" }
      }

      let synced = 0
      let failed = 0

      for (let i = 0; i < pendingEntries.length; i++) {
        const entry = pendingEntries[i]
        this.notifyStatusChange({
          isSyncing: true,
          progress: i + 1,
          total: pendingEntries.length,
        })

        try {
          await offlineDB.updateEntry(entry.id, { status: "syncing" })

          if (entry.actionType === "clock_in") {
            const result = await clockIn({
              employeeId: entry.employeeId,
              employeeName: entry.employeeName,
              projectId: entry.projectId!,
              latitude: entry.latitude,
              longitude: entry.longitude,
              accuracy: entry.accuracy,
            })

            if (result.success) {
              await offlineDB.deleteEntry(entry.id)
              synced++
              console.log("[SyncManager] Synced clock-in:", entry.id)
            } else {
              await offlineDB.updateEntry(entry.id, {
                status: "failed",
                error: result.error,
                retryCount: entry.retryCount + 1,
              })
              failed++
              console.error("[SyncManager] Failed to sync clock-in:", entry.id, result.error)
            }
          } else if (entry.actionType === "clock_out") {
            const result = await clockOut({
              timeEntryId: entry.timeEntryId!,
              latitude: entry.latitude,
              longitude: entry.longitude,
              accuracy: entry.accuracy,
            })

            if (result.success) {
              await offlineDB.deleteEntry(entry.id)
              synced++
              console.log("[SyncManager] Synced clock-out:", entry.id)
            } else {
              await offlineDB.updateEntry(entry.id, {
                status: "failed",
                error: result.error,
                retryCount: entry.retryCount + 1,
              })
              failed++
              console.error("[SyncManager] Failed to sync clock-out:", entry.id, result.error)
            }
          }
        } catch (error) {
          await offlineDB.updateEntry(entry.id, {
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
            retryCount: entry.retryCount + 1,
          })
          failed++
          console.error("[SyncManager] Error syncing entry:", entry.id, error)
        }
      }

      this.isSyncing = false
      this.notifyStatusChange({ isSyncing: false, progress: 0, total: 0 })

      return {
        success: true,
        synced,
        failed,
        message: `Synced ${synced} entries, ${failed} failed`,
      }
    } catch (error) {
      this.isSyncing = false
      this.notifyStatusChange({ isSyncing: false, progress: 0, total: 0 })
      console.error("[SyncManager] Sync failed:", error)
      return {
        success: false,
        synced: 0,
        failed: 0,
        message: error instanceof Error ? error.message : "Sync failed",
      }
    }
  }

  async retryFailedEntries(): Promise<SyncResult> {
    const failedEntries = await offlineDB.getPendingEntriesByStatus("failed")

    // Reset failed entries to pending
    for (const entry of failedEntries) {
      await offlineDB.updateEntry(entry.id, { status: "pending" })
    }

    return this.syncPendingEntries()
  }
}

export interface SyncStatus {
  isSyncing: boolean
  progress: number
  total: number
}

export interface SyncResult {
  success: boolean
  synced: number
  failed: number
  message: string
}

export const syncManager = new SyncManager()
