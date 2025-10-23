export function getMapboxToken(): string {
  // Use MAPBOX_ACCESS_TOKEN (server-side only, not NEXT_PUBLIC_)
  const token = process.env.MAPBOX_ACCESS_TOKEN

  if (!token) {
    throw new Error("MAPBOX_ACCESS_TOKEN is not configured. Add it to your environment variables.")
  }

  return token
}
