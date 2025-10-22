// FileMaker layout names configuration
export const FILEMAKER_LAYOUTS = {
  EMPLOYEES: "L1220_STAFF_List_Entry",
  TIME_ENTRIES: "TimeEntries", // You need to create this layout
  PROJECTS: "PRJ_Projects", // Using existing Projects table
  ADMIN_USERS: "AdminUsers", // You need to create this layout
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

export const TIME_ENTRY_FIELDS = {
  ID: "ID_time_entry", // Auto-enter Serial
  EMPLOYEE_ID: "Employee_ID", // Link to STA_Staff::ID_staff
  EMPLOYEE_NAME: "Employee_Name", // Lookup from STA_Staff::Name_Full
  PROJECT_ID: "Project_ID", // Link to PRJ_Projects::_link_Project IDs | GIRR
  PROJECT_NAME: "Project_Name", // Lookup from PRJ_Projects::Account_Name
  CLOCK_IN: "Clock_In", // Timestamp
  CLOCK_OUT: "Clock_Out", // Timestamp
  CLOCK_IN_LAT: "Clock_In_Latitude", // Number
  CLOCK_IN_LNG: "Clock_In_Longitude", // Number
  CLOCK_OUT_LAT: "Clock_Out_Latitude", // Number
  CLOCK_OUT_LNG: "Clock_Out_Longitude", // Number
  TOTAL_HOURS: "Total_Hours", // Calculation: Hours between Clock_In and Clock_Out
  STATUS: "Status", // Text: "clocked_in", "clocked_out"
  NOTES: "Notes", // Text
  DATE_CREATED: "Date_Created", // Date (Creation Date)
  DATE_MODIFIED: "Date_Modified", // Date (Modification Date)
  TIME_CREATED: "Time_Created", // Time (Creation Time)
  TIME_MODIFIED: "Time_Modified", // Time (Modification Time)
} as const
