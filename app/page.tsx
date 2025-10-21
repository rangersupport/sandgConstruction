import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">S&G Construction</h1>
          <p className="text-lg text-slate-600">Time Clock & Management System</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Employee Login Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Employee Time Clock</CardTitle>
              <CardDescription>Clock in and out at job sites</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 text-center">
                Use your employee number and PIN to access the time clock
              </p>
              <Button asChild className="w-full" size="lg">
                <Link href="/employee/login">Employee Login</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Admin Login Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
              <CardDescription>Manage employees and projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 text-center">Access the admin dashboard to manage operations</p>
              <Button asChild className="w-full bg-transparent" size="lg" variant="outline">
                <Link href="/admin/login">Admin Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
