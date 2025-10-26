# Authentication Flow Guide

## Landing Page

**URL:** `https://sandgservice.com/`

The landing page shows two options:
- **Employee Time Clock** → Links to `/employee/login`
- **Admin Dashboard** → Links to `/admin/login`

---

## Employee Flow

### 1. Employee Login (`/employee/login`)
- Employee enters:
  - Employee Number (e.g., "8400")
  - PIN (4-6 digits)
- First-time login uses default PIN: `1234`
- System validates against FileMaker `STA_Staff` table

### 2. First Login - Change PIN
If employee uses default PIN (`1234`), they must:
- Create a new 4-6 digit PIN
- Confirm the new PIN
- PIN cannot be weak (e.g., 1111, 1234, 4321)
- System updates FileMaker with new PIN

### 3. Employee Dashboard (`/employee`)
After successful login, employee sees:
- **Time Clock Tab:**
  - Clock In/Out buttons
  - Current project selection
  - Active time entry display
  
- **My Tasks Tab:**
  - List of assigned tasks
  - Task details (project, dates, completion %)
  - Update task status and notes
  - Mark tasks complete

### 4. Session Management
- Session stored in `employee_session` cookie
- Valid for 24 hours
- Contains: employee ID, name, number, role

---

## Admin Flow

### 1. Admin Login (`/admin/login`)
- Admin enters:
  - Email address (from FileMaker)
  - Password (stored in PIN_HASH field)
- System validates against FileMaker `STA_Staff` table
- Checks `Web_Admin_Role` field = "admin" or "super_admin"

### 2. Admin Dashboard (`/dashboard`)
After successful login, admin sees:
- **Dashboard Overview:**
  - Active employees count
  - Clocked-in employees
  - Active projects
  - Recent time entries

- **Navigation Menu:**
  - Dashboard
  - Employees (view/manage all employees)
  - Projects (view/manage projects)
  - Tasks (view/manage tasks)
  - Time Clock Dashboard (manual clock in/out)

### 3. Session Management
- Session stored in `admin_session` cookie
- Valid for 7 days
- Contains: admin ID, email, name, role

---

## Security Protection (Middleware)

### Protected Routes

**Admin Routes (require `admin_session`):**
- `/dashboard`
- `/admin/*` (except `/admin/login`, `/admin/setup`)
- `/employees`
- `/projects`
- `/tasks`

**Employee Routes (require `employee_session`):**
- `/employee` (except `/employee/login`)

**Public Routes (no authentication):**
- `/` (landing page)
- `/admin/login`
- `/admin/setup`
- `/employee/login`

### What Happens Without Authentication

**Scenario 1:** User tries to access `/dashboard` without logging in
\`\`\`
1. User visits: https://sandgservice.com/dashboard
2. Middleware checks for admin_session cookie
3. Cookie not found
4. Middleware redirects to: /admin/login
5. User must log in as admin
\`\`\`

**Scenario 2:** User tries to access `/employee` without logging in
\`\`\`
1. User visits: https://sandgservice.com/employee
2. Middleware checks for employee_session cookie
3. Cookie not found
4. Middleware redirects to: /employee/login
5. User must log in as employee
\`\`\`

**Scenario 3:** Admin already logged in tries to access login page
\`\`\`
1. Admin visits: /admin/login
2. Middleware checks for admin_session cookie
3. Cookie found (already logged in)
4. Middleware redirects to: /dashboard
5. Admin sees dashboard
\`\`\`

---

## Complete Flow Examples

### Example 1: Employee Clocking In

\`\`\`
1. Visit: https://sandgservice.com/
2. Click "Employee Login"
3. Enter Employee Number: 8400
4. Enter PIN: 1234 (first time)
5. System prompts: "Change your PIN"
6. Enter new PIN: 5678
7. Confirm PIN: 5678
8. Redirected to: /employee
9. See Time Clock tab
10. Select project from dropdown
11. Click "Clock In"
12. System creates time entry in FileMaker
13. See "Clocked In" status with timer
\`\`\`

### Example 2: Admin Viewing Dashboard

\`\`\`
1. Visit: https://sandgservice.com/
2. Click "Admin Login"
3. Enter Email: admin@sandgservice.com
4. Enter Password: your_password
5. System validates against FileMaker
6. Redirected to: /dashboard
7. See overview with stats:
   - 15 Active Employees
   - 3 Clocked In
   - 8 Active Projects
8. Click "Employees" in navigation
9. See list of all employees
10. Click employee card
11. Manually clock in employee if needed
\`\`\`

### Example 3: Employee Updating Task

\`\`\`
1. Employee logs in (see Example 1)
2. Click "My Tasks" tab
3. See list of assigned tasks
4. Tap task card: "Clean stairs"
5. Task detail dialog opens
6. Adjust completion slider: 50%
7. Change status: "On Track"
8. Add note: "First floor completed"
9. Click "Save Changes"
10. System updates FileMaker T19_TASKS table
11. Dialog closes
12. Task card shows updated status
\`\`\`

---

## FileMaker Integration

### Employee Authentication
**Table:** `STA_Staff`
**Layout:** `L1405_STAFF_List_webApp`

**Fields Used:**
- `Employee_Login_Number` - Employee number for login
- `PIN_HASH` - Stores PIN (plain text currently)
- `Web_Admin_Role` - "admin" or "super_admin" for admin access
- `Email` - Email for admin login
- `Name_Full` - Display name
- `Must_Change_PIN` - Flag for first login
- `PIN_Last_Changed` - Timestamp of last PIN change

### Task Management
**Table:** `T19_TASKS`
**Layout:** `L1405_TASKS_List_webApp`

**Fields Used:**
- `Task_Completion_Percentage` - 0-100%
- `Status` - Normal, On Track, Attention, At Risk
- `Notes` - Task notes/updates
- `Date_Completed` - Auto-set when 100% complete
- `Time_Completed` - Auto-set when 100% complete

---

## Troubleshooting

### "I can't access the dashboard"
- Make sure you're logging in at `/admin/login` (not `/employee/login`)
- Verify your FileMaker record has `Web_Admin_Role` = "admin" or "super_admin"
- Check that your email and password match FileMaker

### "Employee can't log in"
- Verify `Employee_Login_Number` field is populated in FileMaker
- First-time login requires default PIN: `1234`
- Check FileMaker Data API is accessible

### "Session expired"
- Employee sessions expire after 24 hours
- Admin sessions expire after 7 days
- Simply log in again to create new session

---

## Security Notes

1. **Cookies are HTTP-only** - Cannot be accessed by JavaScript (prevents XSS attacks)
2. **Secure in production** - Cookies only sent over HTTPS in production
3. **SameSite protection** - Prevents CSRF attacks
4. **Middleware protection** - All routes checked before access
5. **FileMaker validation** - All authentication validated against FileMaker database

---

## Next Steps

To set up your first admin account:
1. Open FileMaker
2. Go to `STA_Staff` table
3. Find your employee record
4. Set `Web_Admin_Role` = "admin"
5. Set `Email` = your email
6. Set `PIN_HASH` = your desired password
7. Save record
8. Visit `/admin/login` and log in
