# Security Setup Guide

## Current Security Status

✅ **FIXED**: Admin dashboard and protected routes are now secured with authentication middleware.

## What Was Fixed

### 1. Route Protection Added
- `/dashboard` - Now requires admin login
- `/admin/*` - All admin routes protected (except `/admin/login` and `/admin/setup`)
- `/employees` - Protected admin route
- `/projects` - Protected admin route
- `/tasks` - Protected admin route
- `/employee/*` - Protected employee routes (except `/employee/login`)

### 2. Middleware Security
The `middleware.ts` file now:
- Checks for valid admin session cookies before allowing access to admin routes
- Checks for valid employee session cookies before allowing access to employee routes
- Redirects unauthorized users to appropriate login pages
- Prevents logged-in users from accessing login pages (redirects to dashboard)

### 3. Authentication System
Your app uses **FileMaker-based authentication** (NOT Supabase):
- Admin login: Email + Password stored in FileMaker `STA_Staff` table
- Employee login: Employee Number + PIN stored in FileMaker `STA_Staff` table
- Sessions stored in HTTP-only cookies for security

## How to Set Up Admin Access

### Option 1: Use Admin Setup Page (Recommended)
1. Go to: `https://sandgservice.com/admin/setup`
2. Enter your email and create a password
3. This will create an admin user in FileMaker with `Web_Admin_Role = "admin"`

### Option 2: Manually in FileMaker
1. Open your FileMaker database
2. Go to the `STA_Staff` table
3. Find or create your employee record
4. Set these fields:
   - `Email`: Your email address
   - `PIN_Hash`: Your password (temporary - will be hashed in production)
   - `Web_Admin_Role`: Set to `"admin"` or `"super_admin"`
5. Save the record

### Option 3: Use Existing Employee Record
If you already have an employee record in FileMaker:
1. Find your record in `STA_Staff` table
2. Add your email to the `Email` field
3. Set `Web_Admin_Role` to `"admin"`
4. Set `PIN_Hash` to your desired password
5. Login at `/admin/login` with your email and password

## Required FileMaker Fields

Make sure your `STA_Staff` table has these fields:

| Field Name | Type | Purpose |
|------------|------|---------|
| Email | Text | Admin login email |
| PIN_Hash | Text | Password for admin, PIN for employees |
| Web_Admin_Role | Text | Values: "super_admin", "admin", "manager", "employee" |
| Employee_Login_Number | Text | Employee number for employee login |

## Testing Security

### Test Admin Protection
1. Open incognito/private browser window
2. Try to access: `https://sandgservice.com/dashboard`
3. You should be redirected to `/admin/login`
4. After login, you should access the dashboard

### Test Employee Protection
1. Open incognito/private browser window
2. Try to access: `https://sandgservice.com/employee`
3. You should be redirected to `/employee/login`
4. After login, you should access the employee time clock

## Security Best Practices

### Current Implementation
- ✅ HTTP-only cookies (prevents XSS attacks)
- ✅ Secure cookies in production (HTTPS only)
- ✅ Route-level protection via middleware
- ✅ Session validation on every request
- ✅ Separate admin and employee sessions

### Recommended Improvements (Future)
- 🔨 Hash passwords with bcrypt instead of plain text
- 🔨 Add rate limiting to prevent brute force attacks
- 🔨 Add session expiration and refresh tokens
- 🔨 Add audit logging for admin actions
- 🔨 Add two-factor authentication (2FA)
- 🔨 Add IP whitelisting for admin access

## Troubleshooting

### "I can't log in as admin"
1. Check that your FileMaker record has `Web_Admin_Role` set to "admin" or "super_admin"
2. Verify your email and password are correct
3. Check browser console for error messages
4. Try using the `/admin/setup` page to create a new admin

### "I'm still seeing the dashboard without login"
1. Clear your browser cookies
2. Try in incognito/private mode
3. Check that middleware.ts is deployed
4. Verify the session cookie is being set correctly

### "Employees can't access their time clock"
1. Make sure they're using `/employee/login` not `/admin/login`
2. Verify their `Employee_Login_Number` and `PIN_Hash` in FileMaker
3. Check that they have a valid employee record

## Session Management

### Admin Session
- Cookie name: `admin_session`
- Duration: 7 days
- Contains: `{ id, email, name, role }`

### Employee Session
- Cookie name: `employee_session`
- Duration: 24 hours
- Contains: `{ id, name, employeeNumber, role }`

## Next Steps

1. ✅ Test admin login at `/admin/login`
2. ✅ Verify dashboard is protected
3. ✅ Test employee login at `/employee/login`
4. ✅ Confirm unauthorized access is blocked
5. 📋 Plan to implement password hashing (bcrypt)
6. 📋 Add rate limiting for login attempts
7. 📋 Set up audit logging for security events
