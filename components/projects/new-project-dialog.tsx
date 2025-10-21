"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { createProject } from "@/lib/actions/project-actions"
import { useToast } from "@/hooks/use-toast"

export function NewProjectDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      latitude: formData.get("latitude") ? Number.parseFloat(formData.get("latitude") as string) : undefined,
      longitude: formData.get("longitude") ? Number.parseFloat(formData.get("longitude") as string) : undefined,
      geofence_radius: formData.get("geofence_radius")
        ? Number.parseInt(formData.get("geofence_radius") as string)
        : undefined,
    }

    try {
      await createProject(data)
      toast({
        title: "Project created",
        description: `${data.name} has been added successfully.`,
      })
      setOpen(false)
      // Reset form
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>Enter the project details below to add it to your system.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input id="name" name="name" placeholder="Residential Complex Phase 2" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location Address *</Label>
              <Input id="location" name="location" placeholder="123 Main St, Miami, FL 33101" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input id="latitude" name="latitude" type="number" step="any" placeholder="25.7617" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input id="longitude" name="longitude" type="number" step="any" placeholder="-80.1918" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="geofence_radius">Geofence Radius (meters)</Label>
              <Input id="geofence_radius" name="geofence_radius" type="number" min="10" placeholder="100 (default)" />
              <p className="text-xs text-muted-foreground">Employees must be within this distance to clock in</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
