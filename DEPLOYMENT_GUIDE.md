# S&G Construction Time Clock - Deployment Guide

## Overview

This is a FileMaker-first architecture where:
- **FileMaker** is the single source of truth for all data
- **Next.js app** provides a modern mobile-friendly UI for employees
- **No Supabase** - simplified architecture with direct FileMaker integration

## Architecture

\`\`\`
Employee Mobile Browser (Next.js App)
  ↓
  Captures GPS coordinates via browser geolocation API
  ↓
  Sends to FileMaker Data API
  ↓
FileMaker Server (Single Source of Truth)
  ↓
  Stores: employees, time entries, projects, GPS coordinates
  ↓
Admin Dashboard (Next.js App)
  ↓
  Fetches data from FileMaker
  ↓
  Displays maps, reports, analytics
\`\`\`

## Features

### Employee Time Clock
- Clock in/out via mobile browser
- Automatic GPS location capture
- Project selection
- Real-time elapsed time tracking
- Today's hours summary

### GPS Tracking
- Captures latitude/longitude on clock in
- Captures latitude/longitude on clock out
- Stores accuracy information
- Location text stored for reference

### Admin Dashboard
- View all active employees
- See clock-in locations on map
- Time entry reports
- Project tracking

## FileMaker Schema

### TimeEntries Table (T17z_TimeEntries)

The FileMaker database already has all required fields:

| Field Name | Type | Purpose |
|------------|------|---------|
| id | Text | Unique identifier |
| employee_id | Text | Link to STAFF table |
| employee_name | Text | Employee full name |
| project_id | Text | Link to PROJECTS table |
| project_name | Text | Project name |
| clock_in | Timestamp | Clock in time |
| clock_out | Timestamp | Clock out time |
| **clock_in_lat** | Number | Clock in latitude |
| **clock_in_lng** | Number | Clock in longitude |
| **clock_in_location** | Text | Clock in location description |
| **clock_out_lat** | Number | Clock out latitude |
| **clock_out_lng** | Number | Clock out longitude |
| **clock_out_location** | Text | Clock out location description |
| total_hours | Calculation | Auto-calculated hours |
| status | Text | "clocked_in" or "clocked_out" |
| notes | Text | Additional notes |

**No schema changes needed** - FileMaker is already configured!

## Environment Variables

### Required for Deployment

Your FileMaker server is already configured in the workspace:

\`\`\`env
# FileMaker Data API (Already configured in your workspace)
FILEMAKER_SERVER_URL=https://a0111065.fmphost.com
FILEMAKER_DATABASE=SandGservices.fmp12
FILEMAKER_USERNAME=admin
FILEMAKER_PASSWORD=707070Sss$

# FileMaker Sync Token (for push endpoint authentication)
FILEMAKER_SYNC_TOKEN=your-secret-token-change-this-in-production

# Optional: For map display (can add later)
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
\`\`\`

### Not Required (Removed)
- ~~SUPABASE_URL~~ - Not using Supabase
- ~~SUPABASE_SERVICE_ROLE_KEY~~ - Not using Supabase
- ~~NEXT_PUBLIC_MAPBOX_TOKEN~~ - Using Google Maps instead (optional)

## Deployment Steps

### 1. Deploy to Vercel from v0

1. Click **"Publish"** button in v0
2. Connect to Vercel (authorize if first time)
3. Configure project name: `sandg-construction-timeclock`
4. Click **"Deploy"**

### 2. Add Environment Variables

In v0 sidebar:
1. Click **"Vars"**
2. Add the FileMaker variables listed above
3. Click **"Push to Vercel"**

Or in Vercel Dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Add each variable
4. Redeploy

### 3. Test the Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Navigate to employee time clock
3. Test clock in with GPS
4. Verify data appears in FileMaker

## How It Works

### Clock In Flow

1. **Employee opens app** on mobile browser
2. **Browser requests location permission** (one-time)
3. **Employee selects project** from dropdown
4. **Employee clicks "Clock In"**
5. **App captures GPS coordinates**:
   - Latitude
   - Longitude
   - Accuracy (in meters)
6. **App sends to FileMaker**:
   \`\`\`json
   {
     "employee_id": "STA001",
     "project_id": "PRJ123",
     "clock_in": "2025-10-23 20:00:00",
     "clock_in_lat": 28.5383,
     "clock_in_lng": -81.3792,
     "clock_in_location": "28.5383, -81.3792",
     "status": "clocked_in"
   }
   \`\`\`
7. **FileMaker stores the record**
8. **Employee sees confirmation**

### Clock Out Flow

1. **Employee clicks "Clock Out"**
2. **App captures current GPS coordinates**
3. **App updates FileMaker record**:
   \`\`\`json
   {
     "clock_out": "2025-10-23 17:00:00",
     "clock_out_lat": 28.5390,
     "clock_out_lng": -81.3800,
     "clock_out_location": "28.5390, -81.3800",
     "status": "clocked_out"
   }
   \`\`\`
4. **FileMaker auto-calculates total_hours**
5. **Employee sees confirmation with hours worked**

## Map Display (Future Enhancement)

Once deployed, you can add map visualization:

1. Get Google Maps API key (free tier: 28,000 requests/month)
2. Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to Vercel
3. Maps will automatically display clock-in/out locations

## Troubleshooting

### GPS Not Working

**Issue:** "Location permission denied"
**Solution:** 
- Ensure HTTPS (Vercel provides this automatically)
- User must grant location permission in browser
- Check browser settings → Site permissions

**Issue:** "GPS accuracy too low"
**Solution:**
- Move to area with better GPS signal
- Wait a few seconds for GPS to stabilize
- App stores accuracy, so you can filter inaccurate entries later

### FileMaker Connection Issues

**Issue:** "Failed to clock in"
**Solution:**
- Verify FileMaker Data API is enabled
- Check environment variables are correct
- Ensure FileMaker server is accessible from internet
- Check FileMaker user has proper privileges

### Deployment Errors

**Issue:** "Sensitive environment variable exposed"
**Solution:** 
- This has been fixed - no client-side env vars
- All FileMaker credentials are server-side only

## Next Steps After Deployment

1. **Test with real employees** - Have a few employees test clock in/out
2. **Add map visualization** - Get Google Maps API key
3. **Build reports** - Add time entry reports and analytics
4. **Add payroll module** - Calculate payroll from time entries
5. **Add project tracking** - Track time by project/job
6. **Add invoicing** - Generate invoices from time entries

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Vercel deployment logs
3. Check FileMaker Data API logs
4. Contact support at vercel.com/help

## Summary

You now have a production-ready time clock system that:
- ✅ Works on any mobile browser
- ✅ Captures GPS automatically
- ✅ Stores everything in FileMaker
- ✅ No complex database sync
- ✅ Simple, reliable architecture
- ✅ Ready to scale with additional features

**Deploy now and start tracking time!**
