# FileMaker Database Schema for S&G Construction Time Clock

## Tables Status

### ✅ Existing Tables (Already in FileMaker)

#### 1. PRJ_Projects (Projects Table)
**Layout Name:** `PRJ_Projects` (already exists)
**Status:** Already created with 121 fields including interactive calendar

**Key Fields We'll Use:**
| Field Name | Type | Purpose |
|------------|------|---------|
| _link_Project IDs \| GIRR | Text | Unique project identifier |
| Account_Name | Text | Project name |
| _link_Status \| Search | Text | Project status |
| Contact | Text | Project contact |
| Date_Start | Date | Project start date |
| Date_End | Date | Project end date |
| Date_Due | Date | Project due date |
| Billable_Rate | Number | Billing rate |
| Asset | Text | Project asset/location |
| Comments | Text | Project notes |

---

#### 2. STA_Staff (Employees Table)
**Layout Name:** `L1220_STAFF_List_Entry` (already exists)
**Status:** Already created with 97 fields

**Existing Fields We'll Use:**
| Field Name | Type | Purpose |
|------------|------|---------|
| ID_staff | Text | Primary key (Auto-enter Serial) |
| Name_First | Text | First name |
| Name_Last | Text | Last name |
| Name_Full | Calculation | Full name |
| Email | Text | Email address |
| Phone1 | Text | Primary phone |
| Phone2 | Text | Secondary phone |
| Cell | Text | Cell phone |
| Department | Text | Department |
| Category | Text | Role/Category |
| Status | Text | Employment status |
| Hourly_rate | Number | Hourly wage |
| Title | Text | Job title |
| Date_Created | Date | Creation date |
| Date_Modified | Date | Modification date |

**🔨 NEW FIELDS TO ADD to STA_Staff:**
| Field Name | Type | Options | Purpose |
|------------|------|---------|---------|
| Employee_Number | Text | Indexed, Unique | Easy ID like 1001, 1002 for clock in |
| PIN_Hash | Text | Indexed | Hashed 4-digit PIN for authentication |
| Failed_Login_Attempts | Number | Default: 0 | Track failed login attempts |
| Locked_Until | Timestamp | | Account lock timestamp |
| Must_Change_PIN | Number | Default: 1 (boolean) | Force PIN change on first login |

---

### 🔨 Tables to Create

#### 3. TimeEntries Table

**Table Name:** `TimeEntries`
**Layout Name:** `TimeEntries` (create after table)

**Fields to Create:**
| Field Name | Type | Options | Purpose |
|------------|------|---------|---------|
| ID_time_entry | Text | Auto-enter: Serial, Indexed | Primary key |
| Employee_ID | Text | Indexed | Links to STA_Staff::ID_staff |
| Employee_Name | Text | Lookup from STA_Staff::Name_Full | Employee name |
| Project_ID | Text | Indexed | Links to PRJ_Projects::_link_Project IDs \| GIRR |
| Project_Name | Text | Lookup from PRJ_Projects::Account_Name | Project name |
| Clock_In | Timestamp | Required | Clock in time |
| Clock_Out | Timestamp | | Clock out time |
| Clock_In_Latitude | Number | | GPS latitude at clock in |
| Clock_In_Longitude | Number | | GPS longitude at clock in |
| Clock_Out_Latitude | Number | | GPS latitude at clock out |
| Clock_Out_Longitude | Number | | GPS longitude at clock out |
| Total_Hours | Number | Calculation: If(not IsEmpty(Clock_Out); Round((Clock_Out - Clock_In) / 3600; 2); "") | Hours worked |
| Status | Text | Values: "clocked_in", "clocked_out" | Entry status |
| Notes | Text | | Additional notes |
| Date_Created | Date | Auto-enter: Creation Date | Creation date |
| Date_Modified | Date | Auto-enter: Modification Date | Modification date |
| Time_Created | Time | Auto-enter: Creation Time | Creation time |
| Time_Modified | Time | Auto-enter: Modification Time | Modification time |

---

#### 4. AdminUsers Table

**Table Name:** `AdminUsers`
**Layout Name:** `AdminUsers` (create after table)

**Fields to Create:**
| Field Name | Type | Options | Purpose |
|------------|------|---------|---------|
| ID_admin | Text | Auto-enter: Serial, Indexed | Primary key |
| Email | Text | Required, Indexed, Unique | Login email |
| Password_Hash | Text | Required | Hashed password |
| Name | Text | Required | Admin name |
| Role | Text | Values: "super_admin", "admin", "manager" | Access level |
| Is_Active | Number | Values: 0 or 1 (boolean) | Active status |
| Last_Login | Timestamp | | Last login time |
| Date_Created | Date | Auto-enter: Creation Date | Creation date |
| Date_Modified | Date | Auto-enter: Modification Date | Modification date |

---

## Relationships to Create

1. **TimeEntries::Employee_ID → STA_Staff::ID_staff**
   - Allows you to pull employee details into time entries
   - Set to allow creation of related records

2. **TimeEntries::Project_ID → PRJ_Projects::_link_Project IDs | GIRR**
   - Links time entries to your existing projects
   - Set to allow creation of related records

---

## Steps to Implement

### Step 1: Add Fields to STA_Staff
1. Open FileMaker Pro
2. Go to **File → Manage → Database**
3. Click **Fields** tab
4. Select **STA_Staff** table
5. Add these 5 new fields:
   - Employee_Number (Text, Indexed, Unique)
   - PIN_Hash (Text, Indexed)
   - Failed_Login_Attempts (Number, Default: 0)
   - Locked_Until (Timestamp)
   - Must_Change_PIN (Number, Default: 1)

### Step 2: Create TimeEntries Table
1. Click **Tables** tab
2. Create new table: **TimeEntries**
3. Click **Fields** tab
4. Select **TimeEntries** table
5. Add all fields listed above

### Step 3: Create AdminUsers Table
1. Click **Tables** tab
2. Create new table: **AdminUsers**
3. Click **Fields** tab
4. Select **AdminUsers** table
5. Add all fields listed above

### Step 4: Create Relationships
1. Click **Relationships** tab
2. Add relationship: **TimeEntries::Employee_ID = STA_Staff::ID_staff**
3. Add relationship: **TimeEntries::Project_ID = PRJ_Projects::_link_Project IDs | GIRR**

### Step 5: Create Layouts
1. Go to **Layout Mode** (Cmd+L or Ctrl+L)
2. Create layout for **TimeEntries** table
3. Create layout for **AdminUsers** table

---

## Integration Summary

**What's Already Done:**
- ✅ Projects table (PRJ_Projects) with 121 fields and calendar widgets
- ✅ Employees table (STA_Staff) with 97 fields and layout L1220_STAFF_List_Entry

**What You Need to Do:**
- 🔨 Add 5 new fields to STA_Staff table (Employee_Number, PIN_Hash, etc.)
- 🔨 Create TimeEntries table with 17 fields and layout
- 🔨 Create AdminUsers table with 9 fields and layout
- 🔨 Create 2 relationships

**How Dual-Write Works:**
- **FileMaker** stores all business data (employees, time entries, projects)
- **Supabase** stores only location data for real-time mapping
- When employee clocks in/out → writes to both systems simultaneously
- Map reads from Supabase for fast geospatial queries
- Reports and payroll read from FileMaker for business logic
