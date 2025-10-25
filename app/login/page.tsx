import { redirect } from "next/navigation"

// Redirect /login to /admin/login
export default function LoginPage() {
  redirect("/admin/login")
}
