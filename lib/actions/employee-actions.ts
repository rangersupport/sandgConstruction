"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getEmployees() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("employees").select("id, name").order("name")

  if (error) {
    console.error("Error fetching employees:", error)
    return []
  }

  return data
}

export async function createEmployee(formData: {
  name: string
  email: string
  phone: string
  role: string
  hourly_rate: number
  overtime_rate?: number
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("employees")
    .insert({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      hourly_rate: formData.hourly_rate,
      overtime_rate: formData.overtime_rate || formData.hourly_rate * 1.5,
      status: "active",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating employee:", error)
    throw new Error(error.message)
  }

  revalidatePath("/employees")
  return { success: true, data }
}

export async function getAllEmployees() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("employees").select("*").order("name")

  if (error) {
    console.error("Error fetching employees:", error)
    return []
  }

  return data
}
