import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProjectMapMapbox } from "@/components/map/project-map-mapbox"

export default async function MapPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  return (
    <div className="h-screen w-full">
      <ProjectMapMapbox />
    </div>
  )
}
