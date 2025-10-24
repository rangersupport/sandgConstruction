// FileMaker layout names configuration
export const FILEMAKER_LAYOUTS = {
  EMPLOYEES: "T17_STAFF",
  TIME_ENTRIES: "T17z_TimeEntries",
  PROJECTS: "T19_PROJECTS",
  ADMIN_USERS: "AdminUsers",
} as const

export const EMPLOYEE_FIELDS = {
  ID: "ID_staff", // Primary key (Auto-enter Serial)
  NAME_FIRST: "Name_First",
  NAME_LAST: "Name_Last",
  NAME_FULL: "Name_Full", // Calculation field
  PHONE1: "Phone1",
  PHONE2: "Phone2",
  CELL: "Cell",
  EMAIL: "Email",
  DEPARTMENT: "Department",
  CATEGORY: "Category", // Used as role
  STATUS: "Status",
  HOURLY_RATE: "Hourly_rate",
  TITLE: "Title",
  BIRTHDAY: "Birthday",
  STREET1: "Street1",
  STREET2: "Street2",
  CITY: "City",
  STATE: "State_Province",
  POSTAL_CODE: "Postal_Code",
  SOCIAL_SECURITY: "Social_Security",
  GENDER: "Gender",
  FILEMAKER_ACCOUNT: "FileMaker_Account",
  DATE_CREATED: "Date_Created",
  DATE_MODIFIED: "Date_Modified",
  EMPLOYEE_LOGIN_NUMBER: "Employee_Login_Number", // Need to add this field
  PIN_HASH: "PIN_Hash", // Need to add this field
  FAILED_LOGIN_ATTEMPTS: "Failed_Login_Attempts", // Need to add this field
  LOCKED_UNTIL: "Locked_Until", // Need to add this field
  MUST_CHANGE_PIN: "Must_Change_PIN", // Need to add this field
  PIN_CHANGED: "PIN_Changed", // Number: 0 or 1
  PIN_LAST_CHANGED: "PIN_Last_Changed", // Timestamp
  WEB_ADMIN_ROLE: "Web_Admin_Role", // Need to add this field - for web app admin access
} as const

export const PROJECT_FIELDS = {
  ID: "ID_project",
  NAME: "Project_Name",
  ACCOUNT_NAME: "Account_Name",
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

export const TIME_ENTRY_FIELDS = {
  ID: "ID_time_entry", // Auto-enter Serial
  EMPLOYEE_ID: "employee_id", // Link to STA_Staff::ID_staff
  EMPLOYEE_NAME: "employee_name", // Lookup from STA_Staff::Name_Full
  PROJECT_ID: "project_id", // Link to PRJ_Projects::_link_Project IDs | GIRR
  PROJECT_NAME: "project_name", // Lookup from PRJ_Projects::Account_Name
  CLOCK_IN: "clock_in", // Timestamp
  CLOCK_OUT: "clock_out", // Timestamp
  CLOCK_IN_LAT: "clock_in_lat", // Number (changed from Clock_In_Latitude)
  CLOCK_IN_LNG: "clock_in_lng", // Number (changed from Clock_In_Longitude)
  CLOCK_OUT_LAT: "clock_out_lat", // Number (changed from Clock_Out_Latitude)
  CLOCK_OUT_LNG: "clock_out_lng", // Number (changed from Clock_Out_Longitude)
  CLOCK_IN_LOCATION: "clock_in_location", // Text field for location description
  CLOCK_OUT_LOCATION: "clock_out_location", // Text field for location description
  TOTAL_HOURS: "total_hours", // Calculation: Hours between clock_in and clock_out
  STATUS: "status", // Text: "clocked_in", "clocked_out"
  NOTES: "notes", // Text
  CREATED_AT: "created_at", // Timestamp (Creation)
  MODIFIED_AT: "modified_at", // Timestamp (Modification)
  CREATOR: "creator", // Text (Created by)
  MODIFIER: "modifier", // Text (Modified by)
} as const
