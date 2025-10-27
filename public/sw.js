// Service Worker for S&G Construction Time Clock
// Version: 1.0.1

const CACHE_VERSION = "v1.0.1"
const CACHE_NAME = `sandg-timeclock-${CACHE_VERSION}`

// Assets to cache on install
const STATIC_ASSETS = ["/offline"]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker version:", CACHE_VERSION)

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log("[SW] Skip waiting")
        return self.skipWaiting()
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker version:", CACHE_VERSION)

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith("sandg-timeclock-") && name !== CACHE_NAME)
            .map((name) => {
              console.log("[SW] Deleting old cache:", name)
              return caches.delete(name)
            }),
        )
      })
      .then(() => {
        console.log("[SW] Claiming clients")
        return self.clients.claim()
      }),
  )
})

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip chrome extensions and other protocols
  if (!url.protocol.startsWith("http")) {
    return
  }

  const authRoutes = ["/employee/login", "/admin/login", "/api/auth"]
  if (authRoutes.some((route) => url.pathname.startsWith(route))) {
    return
  }

  // Network-first strategy for API calls
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: "Offline - request queued" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        })
      }),
    )
    return
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === "error" || response.type === "opaqueredirect") {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/offline")
          }
          return new Response("Offline", { status: 503 })
        })
    }),
  )
})

// Background sync event - sync pending time entries
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync event:", event.tag)

  if (event.tag === "sync-time-entries") {
    event.waitUntil(syncPendingEntries())
  }
})

// Sync pending time entries from IndexedDB to server
async function syncPendingEntries() {
  console.log("[SW] Syncing pending time entries")

  try {
    // Open IndexedDB
    const db = await openDB()
    const tx = db.transaction("pending_entries", "readonly")
    const store = tx.objectStore("pending_entries")
    const entries = await store.getAll()

    console.log("[SW] Found pending entries:", entries.length)

    // Sync each entry
    for (const entry of entries) {
      try {
        const response = await fetch("/api/sync-time-entry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        })

        if (response.ok) {
          // Remove from IndexedDB after successful sync
          const deleteTx = db.transaction("pending_entries", "readwrite")
          const deleteStore = deleteTx.objectStore("pending_entries")
          await deleteStore.delete(entry.id)
          console.log("[SW] Synced and removed entry:", entry.id)
        }
      } catch (error) {
        console.error("[SW] Failed to sync entry:", entry.id, error)
      }
    }

    // Notify clients that sync is complete
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETE",
        count: entries.length,
      })
    })
  } catch (error) {
    console.error("[SW] Sync failed:", error)
    throw error
  }
}

// Helper to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SandGTimeClockDB", 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains("pending_entries")) {
        db.createObjectStore("pending_entries", { keyPath: "id" })
      }
    }
  })
}
