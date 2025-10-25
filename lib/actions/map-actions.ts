"use server"

export async function getMapboxToken(): Promise<string> {
  return process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""
}
