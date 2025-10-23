import { FileMakerSyncPanel } from "@/components/admin/filemaker-sync-panel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminSettingsPage() {
  // These should not be exposed to the client for security reasons
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
            <CardTitle>System Status</CardTitle>
            <CardDescription>Integration status and configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">FileMaker Integration:</span>
                <span className="font-mono text-green-600">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supabase Integration:</span>
                <span className="font-mono text-green-600">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sync Status:</span>
                <span className="font-mono">Ready</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
