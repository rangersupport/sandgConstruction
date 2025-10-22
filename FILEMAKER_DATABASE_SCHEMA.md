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

**Calendar Widgets:** Your table includes interactive calendar fields that we can leverage for project scheduling.

---

#### 2. STAFF Table (Employees)
**Layout Name:** `L1220_STAFF_List_Entry` (already exists)
**Status:** Already created

**Required Fields for Integration:**
- `employee_number` or `id` - Unique identifier
- `name` - Employee full name
- `phone` - Phone number
- `pin` or `pin_hash` - 4-digit PIN for clock in/out
- `role` - Values: "employee", "supervisor", "admin"
- `hourly_wage` - Hourly pay rate
- `is_active` - Active status

---

### 🔨 Tables to Create

#### 3. TimeEntries Table

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
| project_id | Text | Links to PRJ_Projects::_link_Project IDs \| GIRR |
| project_name | Text | |
| total_hours | Number | Calculation: If(not IsEmpty(clock_out); Round((clock_out - clock_in) / 3600; 2); "") |
| status | Text | Values: "clocked_in", "clocked_out" |
| notes | Text | |
| created_at | Timestamp | Auto-enter: Current Timestamp |
| updated_at | Timestamp | Auto-enter: Modification Timestamp |

**Layout Name:** `TimeEntries` (create after table)

---

#### 4. AdminUsers Table

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

## Relationships to Create

1. **TimeEntries::employee_id → STAFF::employee_number**
   - Allows you to pull employee details into time entries

2. **TimeEntries::project_id → PRJ_Projects::_link_Project IDs | GIRR**
   - Links time entries to your existing projects

---

## Steps to Create in FileMaker

1. **Open FileMaker Pro**
2. **Go to File → Manage → Database**
3. **Click "Tables" tab**
4. **Create two new tables:** `TimeEntries` and `AdminUsers`
5. **Click "Fields" tab**
6. **Select TimeEntries table and add the fields** listed above
7. **Select AdminUsers table and add the fields** listed above
8. **Click "Relationships" tab**
9. **Create the relationships** listed above
10. **Create Layouts:**
    - Go to Layout Mode
    - Create layout for `TimeEntries`
    - Create layout for `AdminUsers`

---

## Integration Summary

**What's Already Done:**
- ✅ Projects table (PRJ_Projects) with 121 fields and calendar widgets
- ✅ Employees table (STAFF) with layout L1220_STAFF_List_Entry

**What You Need to Create:**
- 🔨 TimeEntries table and layout
- 🔨 AdminUsers table and layout

**How Dual-Write Works:**
- **FileMaker** stores all business data (employees, time entries, projects)
- **Supabase** stores only location data for real-time mapping
- When employee clocks in/out → writes to both systems simultaneously
