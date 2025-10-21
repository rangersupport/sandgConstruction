"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface Employee {
  id: string
  name: string
  project_name: string
  latitude: number
  longitude: number
  clock_in: string
  hours_elapsed: number
}

interface MapViewProps {
  employees: Employee[]
  center: [number, number]
  onMarkerClick: (id: string) => void
  selectedEmployee: string | null
}

export default function MapView({ employees, center, onMarkerClick, selectedEmployee }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      const map = L.map("map").setView(center, 10)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      mapRef.current = map
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    // Create custom green icon for active employees
    const greenIcon = L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          background-color: #22c55e;
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 16px;
            font-weight: bold;
          ">👷</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })

    // Add markers for each employee
    employees.forEach((employee) => {
      const marker = L.marker([employee.latitude, employee.longitude], {
        icon: greenIcon,
      }).addTo(mapRef.current!)

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${employee.name}</h3>
          <p style="color: #666; margin-bottom: 8px; font-size: 14px;">${employee.project_name}</p>
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #666;">
            <div>⏱️ ${employee.hours_elapsed.toFixed(1)} hours</div>
            <div>📍 ${employee.latitude.toFixed(4)}, ${employee.longitude.toFixed(4)}</div>
            <div>🕐 Clocked in: ${new Date(employee.clock_in).toLocaleTimeString()}</div>
          </div>
        </div>
      `

      marker.bindPopup(popupContent)

      marker.on("click", () => {
        onMarkerClick(employee.id)
      })

      markersRef.current.set(employee.id, marker)
    })

    // Adjust map bounds to show all markers
    if (employees.length > 0) {
      const bounds = L.latLngBounds(employees.map((e) => [e.latitude, e.longitude]))
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [employees, onMarkerClick])

  // Highlight selected employee marker
  useEffect(() => {
    if (!selectedEmployee) return

    const marker = markersRef.current.get(selectedEmployee)
    if (marker) {
      marker.openPopup()
      mapRef.current?.panTo(marker.getLatLng())
    }
  }, [selectedEmployee])

  return <div id="map" className="w-full h-full" />
}
