# Quick Start: Time Clock & Map Setup

## Priority: Get Clock In/Out Working First

### Step 1: Add 6 Fields to STA_Staff Table (5 minutes)

Open FileMaker Pro → File → Manage → Database → Fields tab → Select STA_Staff:

| Field Name | Type | Options |
|------------|------|---------|
| Employee_Login_Number | Text | Indexed, Unique |
| PIN_Hash | Text | Indexed |
| Failed_Login_Attempts | Number | Default: 0 |
| Locked_Until | Timestamp | |
| Must_Change_PIN | Number | Default: 1 |
| Web_Admin_Role | Text | Default: "employee" |

### Step 2: Create TimeEntries Table (10 minutes)

File → Manage → Database → Tables tab → Create new table: **TimeEntries**

Add these fields:

| Field Name | Type | Options |
|------------|------|---------|
| ID_time_entry | Text | Auto-enter Serial, Indexed |
| Employee_ID | Text | Indexed |
| Employee_Name | Text | |
| Clock_In | Timestamp | Required |
| Clock_Out | Timestamp | |
| Clock_In_Latitude | Number | |
| Clock_In_Longitude | Number | |
| Clock_Out_Latitude | Number | |
| Clock_Out_Longitude | Number | |
| Total_Hours | Number | Calculation: `Round((Clock_Out - Clock_In) / 3600; 2)` |
| Status | Text | Default: "clocked_in" |
| Notes | Text | |
| Date_Created | Date | Auto-enter Creation Date |
| Date_Modified | Date | Auto-enter Modification Date |

### Step 3: Create TimeEntries Layout

Layout Mode → New Layout → Name: **TimeEntries** → Based on TimeEntries table

### Step 4: Add Environment Variables to Netlify

Go to Netlify → Your site → Site settings → Environment variables → Add:

\`\`\`
FILEMAKER_SERVER_URL=https://a0111065.fmphost.com
FILEMAKER_DATABASE=SandGservices.fmp12
FILEMAKER_USERNAME=admin
FILEMAKER_PASSWORD=707070Sss$
\`\`\`

### Step 5: Deploy to Netlify

Push your code to GitHub, Netlify will auto-deploy.

---

## How It Works

**Clock In Flow:**
1. Employee enters Employee_Login_Number (e.g., 1001) and PIN
2. System verifies against FileMaker STA_Staff table
3. Creates time entry in FileMaker TimeEntries table
4. Writes location to Supabase for map display
5. Employee sees confirmation

**Map Display:**
- Reads real-time locations from Supabase
- Shows active employees on Mapbox
- Updates automatically as employees clock in/out

**Dual-Write:**
- FileMaker = master data (employees, time entries, payroll)
- Supabase = location data only (for fast map queries)

---

## Test It

1. Add a test employee in FileMaker STA_Staff:
   - Employee_Login_Number: 1001
   - PIN_Hash: (will be generated on first login)
   - Name_First: John
   - Name_Last: Doe

2. Go to sandgservice.com/employee/login
3. Enter 1001 and default PIN: 1234
4. Clock in
5. Check map at sandgservice.com/map

Done! 🎉
