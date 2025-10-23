# FileMaker Schema Update for GPS Tracking

## Required Fields in T17z_TimeEntries Table

Add these fields to your FileMaker **T17z_TimeEntries** table if they don't already exist:

### GPS Location Fields

| Field Name | Type | Description |
|------------|------|-------------|
| `clock_in_lat` | Number | Latitude coordinate when employee clocked in |
| `clock_in_lng` | Number | Longitude coordinate when employee clocked in |
| `clock_out_lat` | Number | Latitude coordinate when employee clocked out |
| `clock_out_lng` | Number | Longitude coordinate when employee clocked out |
| `clock_in_location` | Text | Human-readable location (lat, lng format) |
| `clock_out_location` | Text | Human-readable location (lat, lng format) |

### Field Settings

- **Number fields**: Set to store decimal values with 6-8 decimal places for GPS precision
- **Text fields**: Set to 100 characters max

### Example Data

\`\`\`
clock_in_lat: 26.123456
clock_in_lng: -80.234567
clock_in_location: "26.123456, -80.234567"
\`\`\`

## How It Works

1. Employee opens Next.js app on phone
2. Browser captures GPS coordinates automatically
3. Employee selects project and clicks "Clock In"
4. GPS data sent to FileMaker along with timestamp
5. FileMaker stores: employee, project, time, and GPS coordinates
6. Admin can view clock-ins on map in dashboard

## Next Steps

1. Add these fields to FileMaker T17z_TimeEntries table
2. Test clock-in from Next.js app
3. Verify GPS data appears in FileMaker
4. (Optional) Add map view in FileMaker using Web Viewer
