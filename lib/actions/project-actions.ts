"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createProject(formData: {
  name: string
  location: string
  latitude?: number
  longitude?: number
  geofence_radius?: number
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: formData.name,
      location: formData.location,
      latitude: formData.latitude,
      longitude: formData.longitude,
      geofence_radius: formData.geofence_radius || 100,
      status: "active",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating project:", error)
    throw new Error(error.message)
  }

  revalidatePath("/projects")
  return { success: true, data }
}

export async function getAllProjects() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("projects").select("*").order("name")

  if (error) {
    console.error("Error fetching projects:", error)
    return []
  }

  return data
}
