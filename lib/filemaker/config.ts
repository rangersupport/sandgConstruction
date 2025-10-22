// FileMaker layout names configuration
export const FILEMAKER_LAYOUTS = {
  EMPLOYEES: "L1220_STAFF_List_Entry",
  TIME_ENTRIES: "TimeEntries", // You need to create this layout
  PROJECTS: "Projects", // You need to create this layout
  ADMIN_USERS: "AdminUsers", // You need to create this layout
} as const

// FileMaker field mappings for employees
export const EMPLOYEE_FIELDS = {
  ID: "employee_id",
  NUMBER: "employee_number",
  NAME: "name",
  PHONE: "phone",
  EMAIL: "email",
  ROLE: "role",
  HOURLY_WAGE: "hourly_wage",
  PIN_HASH: "pin_hash",
  STATUS: "status",
} as const
