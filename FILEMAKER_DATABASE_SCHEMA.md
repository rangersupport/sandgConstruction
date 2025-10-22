# FileMaker Database Schema for S&G Construction Time Clock

## Tables to Create in FileMaker

### 1. TimeEntries Table

**Table Name:** `TimeEntries`

**Fields:**
| Field Name | Type | Options |
|------------|------|---------|
| id | Text | Auto-enter: UUID, Indexed |
| employee_id | Text | Indexed |
| employee_name | Text | |
| clock_in | Timestamp | Required |
| clock_out | Timestamp | |
| clock_in_location | Text | Store as JSON: {"lat": 0, "lng": 0, "address": ""} |
| clock_out_location | Text | Store as JSON: {"lat": 0, "lng": 0, "address": ""} |
| project_id | Text | |
| project_name | Text | |
| total_hours | Number | Calculation: If(not IsEmpty(clock_out); Round((clock_out - clock_in) / 3600; 2); "") |
| status | Text | Values: "clocked_in", "clocked_out" |
| notes | Text | |
| created_at | Timestamp | Auto-enter: Current Timestamp |
| updated_at | Timestamp | Auto-enter: Modification Timestamp |

**Layout Name:** `TimeEntries` (create after table)

---

### 2. Projects Table

**Table Name:** `Projects`

**Fields:**
| Field Name | Type | Options |
|------------|------|---------|
| id | Text | Auto-enter: UUID, Indexed |
| name | Text | Required, Indexed |
| address | Text | |
| location | Text | Store as JSON: {"lat": 0, "lng": 0} |
| status | Text | Values: "active", "completed", "on_hold" |
| start_date | Date | |
| end_date | Date | |
| supervisor_id | Text | |
| supervisor_name | Text | |
| description | Text | |
| created_at | Timestamp | Auto-enter: Current Timestamp |
| updated_at | Timestamp | Auto-enter: Modification Timestamp |

**Layout Name:** `Projects` (create after table)

---

### 3. AdminUsers Table

**Table Name:** `AdminUsers`

**Fields:**
| Field Name | Type | Options |
|------------|------|---------|
| id | Text | Auto-enter: UUID, Indexed |
| email | Text | Required, Indexed, Unique |
| password_hash | Text | Required |
| name | Text | Required |
| role | Text | Values: "super_admin", "admin", "manager" |
| is_active | Number | Values: 0 or 1 (boolean) |
| last_login | Timestamp | |
| created_at | Timestamp | Auto-enter: Current Timestamp |
| updated_at | Timestamp | Auto-enter: Modification Timestamp |

**Layout Name:** `AdminUsers` (create after table)

---

## Existing Table

### 4. STAFF Table (Already exists)

**Layout Name:** `L1220_STAFF_List_Entry` (already exists)

**Required Fields for Integration:**
- `employee_number` or `id` - Unique identifier
- `name` - Employee full name
- `phone` - Phone number
- `pin` or `pin_hash` - 4-digit PIN for clock in/out
- `role` - Values: "employee", "supervisor", "admin"
- `hourly_wage` - Hourly pay rate
- `is_active` - Active status (0 or 1)

---

## Relationships to Create (Optional but Recommended)

1. **TimeEntries::employee_id → STAFF::employee_number**
   - Allows you to pull employee details into time entries

2. **TimeEntries::project_id → Projects::id**
   - Links time entries to projects

3. **Projects::supervisor_id → STAFF::employee_number**
   - Links projects to supervisor employees

---

## Steps to Create in FileMaker

1. **Open FileMaker Pro**
2. **Go to File → Manage → Database**
3. **Click "Tables" tab**
4. **Create each table** (TimeEntries, Projects, AdminUsers)
5. **Click "Fields" tab**
6. **Select each table and add the fields** listed above
7. **Click "Relationships" tab** (optional)
8. **Create the relationships** listed above
9. **Create Layouts:**
   - Go to Layout Mode
   - Create a new layout for each table
   - Name them: `TimeEntries`, `Projects`, `AdminUsers`
   - Add the fields you want to display/edit

---

## After Creating Tables

Once you've created these tables and layouts in FileMaker, the Next.js app will be able to:
- Write time entries to FileMaker when employees clock in/out
- Read employee data from your existing STAFF table
- Manage projects and admin users
- Sync location data to Supabase for mapping

The dual-write architecture will write:
- **Full time entry data → FileMaker** (master database)
- **Location data only → Supabase** (for real-time mapping)
