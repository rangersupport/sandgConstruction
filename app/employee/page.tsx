import { TimeClock } from '@/components/employee/time-clock';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function EmployeePage() {
  const supabase = await createClient();

  // TEMPORARILY COMMENTED OUT FOR TESTING - BYPASS AUTH
  // const { data: { user }, error: userError } = await supabase.auth.getUser();

  // if (userError || !user) {
  //   redirect('/auth/login');
  // }

  // Get the first active employee, or any employee if none are active
  const { data: employees, error: employeeError } = await supabase
    .from('employees')
    .select('*')
    .order('status', { ascending: true }) // 'active' comes before 'inactive'
    .limit(1);

  // Debug logging
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Supabase Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log('Employees query result:', { employees, employeeError });

  // Test simple connection with more details
  const { data: testData, error: testError } = await supabase
    .from('employees')
    .select('count')
    .limit(1);
  console.log('Test connection result:', { testData, testError });

  // Test with RLS bypass (if you have service role key)
  const { data: allEmployees, error: allError } = await supabase
    .from('employees')
    .select('id, first_name, last_name, status')
    .limit(5);
  console.log('All employees query:', { allEmployees, allError });

  if (employeeError) {
    console.error('Database error:', employeeError);
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Database Error</h1>
          <p className="text-muted-foreground">
            Unable to connect to database. Please try again later.
          </p>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {employeeError.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">No Employees Found</h1>
          <p className="text-muted-foreground">
            No employee records found in the database. Please contact your administrator.
          </p>
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>For Testing:</strong> You may need to add employee data to your Supabase database.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const employee = employees[0];

  const employeeName = `${employee.first_name} ${employee.last_name}`;

  return (
    <div className="min-h-screen bg-background">
      <TimeClock 
        employeeId={employee.id} 
        employeeName={employeeName}
      />
    </div>
  );
}
