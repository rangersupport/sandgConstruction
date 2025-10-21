"use server"

import { createClient } from "@/lib/supabase/server"

export async function getEmployees() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("employees").select("id, name").order("name")

  if (error) {
    console.error("Error fetching employees:", error)
    return []
  }

  return data
}
