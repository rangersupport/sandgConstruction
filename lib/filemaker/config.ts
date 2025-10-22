// FileMaker layout names configuration
export const FILEMAKER_LAYOUTS = {
  EMPLOYEES: "L1220_STAFF_List_Entry",
  TIME_ENTRIES: "TimeEntries", // You need to create this layout
  PROJECTS: "PRJ_Projects", // Using existing Projects table
  ADMIN_USERS: "AdminUsers", // You need to create this layout
} as const

export const PROJECT_FIELDS = {
  ID: "_link_Project IDs | GIRR",
  NAME: "Account_Name",
  STATUS: "_link_Status | Search",
  CONTACT: "Contact",
  COMMENTS: "Comments",
  DATE_START: "Date_Start",
  DATE_END: "Date_End",
  DATE_DUE: "Date_Due",
  DATE_CREATED: "Date_Created",
  DATE_MODIFIED: "Date_Modified",
  BILLABLE_RATE: "Billable_Rate",
  ASSET: "Asset",
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

export const TIME_ENTRY_FIELDS = {
  ID: "id",
  EMPLOYEE_ID: "employee_id",
  EMPLOYEE_NAME: "employee_name",
  CLOCK_IN: "clock_in",
  CLOCK_OUT: "clock_out",
  CLOCK_IN_LOCATION: "clock_in_location",
  CLOCK_OUT_LOCATION: "clock_out_location",
  PROJECT_ID: "project_id",
  PROJECT_NAME: "project_name",
  TOTAL_HOURS: "total_hours",
  STATUS: "status",
  NOTES: "notes",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
} as const
