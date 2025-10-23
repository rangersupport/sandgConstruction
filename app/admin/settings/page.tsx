import { FileMakerSyncPanel } from "@/components/admin/filemaker-sync-panel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminSettingsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage system settings and integrations</p>
      </div>

      <div className="grid gap-6">
        <FileMakerSyncPanel />

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Current system configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">FileMaker Server:</span>
                <span className="font-mono">{process.env.FILEMAKER_SERVER_URL || "Not configured"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">FileMaker Database:</span>
                <span className="font-mono">{process.env.FILEMAKER_DATABASE || "Not configured"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supabase URL:</span>
                <span className="font-mono">{process.env.NEXT_PUBLIC_SUPABASE_URL || "Not configured"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
