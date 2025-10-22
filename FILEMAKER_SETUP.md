# FileMaker Integration Setup

This application uses a **dual-write architecture** where:
- **FileMaker** = Master data source (employees, time entries, projects, payroll)
- **Supabase** = Location/mapping data only (for real-time map updates)

## Architecture

\`\`\`
Employee clocks in/out
    ↓
Next.js writes to BOTH:
    ├─→ FileMaker (full business data)
    └─→ Supabase (location data for mapping)
    
Reports/Payroll ← FileMaker
Map Display ← Supabase
\`\`\`

## Required FileMaker Setup

### 1. Database Tables/Layouts

Create these layouts in your FileMaker database:

#### **Employees** Layout
Fields:
- `employee_id` (Text, Primary Key)
- `employee_number` (Number, Unique)
- `name` (Text)
- `phone` (Text)
- `email` (Text)
- `role` (Text: "worker", "supervisor", "admin")
- `hourly_wage` (Number)
- `pin_hash` (Text)
- `status` (Text: "active", "inactive")
- `created_at` (Timestamp)

#### **TimeEntries** Layout
Fields:
- `id` (Text, Primary Key)
- `employee_id` (Text, Foreign Key)
- `project_id` (Text, Foreign Key)
- `clock_in` (Timestamp)
- `clock_out` (Timestamp)
- `clock_in_lat` (Number)
- `clock_in_lng` (Number)
- `clock_out_lat` (Number)
- `clock_out_lng` (Number)
- `location_verified` (Number: 0 or 1)
- `distance_from_project` (Number)
- `status` (Text: "clocked_in", "clocked_out")
- `hours_worked` (Number, calculated)

#### **Projects** Layout
Fields:
- `id` (Text, Primary Key)
- `name` (Text)
- `address` (Text)
- `latitude` (Number)
- `longitude` (Number)
- `status` (Text: "active", "completed", "on_hold")
- `geofence_radius` (Number, default: 100)

#### **AdminUsers** Layout
Fields:
- `id` (Text, Primary Key)
- `email` (Text, Unique)
- `password_hash` (Text)
- `name` (Text)
- `role` (Text: "super_admin", "admin")
- `created_at` (Timestamp)

### 2. Enable FileMaker Data API

1. Open FileMaker Server Admin Console
2. Go to **Database Server** > **FileMaker Data API**
3. Enable the Data API
4. Note your server URL (e.g., `https://your-server.com`)

### 3. Create API User

1. In FileMaker Pro, open your database
2. Go to **File** > **Manage** > **Security**
3. Create a new account:
   - Account Name: `api_user` (or your choice)
   - Password: Strong password
   - Privilege Set: **Full Access** or custom with:
     - View, Edit, Create, Delete records in all tables
     - Access via FileMaker Data API enabled

### 4. Configure Environment Variables

Add these to your Netlify environment variables:

\`\`\`
FILEMAKER_SERVER_URL=https://your-filemaker-server.com
FILEMAKER_DATABASE=YourDatabaseName
FILEMAKER_USERNAME=api_user
FILEMAKER_PASSWORD=your_secure_password
\`\`\`

### 5. Test Connection

After deploying, the system will:
1. Write time entries to FileMaker when employees clock in/out
2. Write location data to Supabase for map display
3. Pull employee data from FileMaker for reports

## Data Flow

### Clock In
1. Employee enters number + PIN
2. System verifies credentials (FileMaker)
3. Gets GPS location
4. Writes to FileMaker: Full time entry record
5. Writes to Supabase: Location data only
6. Map updates in real-time (Supabase subscription)

### Clock Out
1. Employee clocks out
2. Gets GPS location
3. Updates FileMaker: Clock out time + location
4. Updates Supabase: Clock out location
5. FileMaker calculates hours worked

### Reports
- All business reports pull from FileMaker
- Map displays pull from Supabase
- Single source of truth: FileMaker

## Benefits

- **FileMaker expertise**: Use what you know
- **Real-time maps**: Leverage Supabase's geospatial features
- **Data integrity**: FileMaker is master, Supabase is cache
- **Simplified architecture**: One primary database
- **Easy reporting**: All data in FileMaker for reports

## Troubleshooting

### FileMaker connection fails
- Check server URL is correct (include https://)
- Verify API is enabled in FileMaker Server
- Confirm username/password are correct
- Check firewall allows connections to FileMaker Server

### Data not syncing
- Check browser console for errors
- Verify both FileMaker and Supabase credentials are set
- System will continue working if one fails (graceful degradation)

### Map not showing workers
- Map reads from Supabase only
- Check Supabase connection
- Verify location data is being written to Supabase
