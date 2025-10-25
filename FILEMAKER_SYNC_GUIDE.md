# FileMaker to Supabase Sync Guide

This guide explains how to sync employees from FileMaker to Supabase.

## Two Sync Methods

### Method 1: Push from FileMaker (Recommended for Real-time Updates)

Create a button in FileMaker that pushes employee data to Supabase when clicked.

#### FileMaker Script Setup

1. **Create a new script in FileMaker** called "Sync Employee to Supabase"

2. **Add the following script steps:**

```filemaker
# Set variables for the employee data
Set Variable [ $employeeNumber ; Value: T17_STAFF::ID_staff ]
Set Variable [ $firstName ; Value: T17_STAFF::Name_First ]
Set Variable [ $lastName ; Value: T17_STAFF::Name_Last ]
Set Variable [ $fullName ; Value: T17_STAFF::Name_Full ]
Set Variable [ $email ; Value: T17_STAFF::Email ]
Set Variable [ $phone ; Value: T17_STAFF::Cell ]
Set Variable [ $role ; Value: T17_STAFF::Category ]
Set Variable [ $status ; Value: T17_STAFF::Status ]
Set Variable [ $hourlyRate ; Value: T17_STAFF::HourlyRate ]
Set Variable [ $pin ; Value: T17_STAFF::PIN ]

# Build JSON payload
Set Variable [ $json ; Value: 
  "{" & 
  "\"employees\": [{" &
  "\"employee_number\": \"" & $employeeNumber & "\"," &
  "\"name\": \"" & $fullName & "\"," &
  "\"email\": \"" & $email & "\"," &
  "\"phone\": \"" & $phone & "\"," &
  "\"role\": \"" & $role & "\"," &
  "\"status\": \"" & $status & "\"," &
  "\"hourly_rate\": " & $hourlyRate & "," &
  "\"pin\": \"" & $pin & "\"" &
  "}]}"
]

# Set API endpoint URL (replace with your actual URL)
Set Variable [ $apiUrl ; Value: "https://your-app.vercel.app/api/sync/employees/push" ]

# Set authorization token (add this as an environment variable in your Next.js app)
Set Variable [ $authToken ; Value: "your-secret-token" ]

# Make the API call
Insert from URL [ 
  Select ; 
  With dialog: Off ; 
  Target: $$syncResult ; 
  $apiUrl ; 
  Verify SSL Certificates ; 
  cURL options: 
    "-X POST" & 
    " -H \"Content-Type: application/json\"" & 
    " -H \"Authorization: Bearer " & $authToken & "\"" & 
    " -d '" & $json & "'"
]

# Show result
Show Custom Dialog [ 
  Title: "Sync Complete" ; 
  Message: $$syncResult 
]
