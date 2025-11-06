import { calculateWeeklyPayroll } from "@/lib/actions/payroll-actions"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getWeekStart } from "@/lib/utils/date-helpers"
import { formatDate } from "@/lib/utils/date-helpers"

export default async function PayrollChecksPage() {
  const weekStart = getWeekStart()
  const payrollData = await calculateWeeklyPayroll(weekStart)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll Checks</h1>
          <p className="text-muted-foreground">
            Week of {formatDate(weekStart)} - {formatDate(weekEnd)}
          </p>
        </div>
        <Link href="/admin/payroll">
          <Button variant="outline">Back to Payroll</Button>
        </Link>
      </div>

      {payrollData.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center py-8">No unpaid payroll for this week</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {payrollData.map((employee, index) => (
            <PayrollCheckCard key={index} employee={employee} />
          ))}
        </div>
      )}
    </div>
  )
}

function PayrollCheckCard({ employee }: { employee: any }) {
  const today = new Date()

  return (
    <Card className="border-2 print:page-break-after-always print:border-gray-300">
      <CardHeader className="border-b pb-4">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold">S&G CONSTRUCTION</h2>
            <p className="text-sm text-muted-foreground">PAYROLL CHECK</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">Check Date: {today.toLocaleDateString()}</p>
            <p className="text-sm text-muted-foreground">Florida, USA</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Employee Info */}
        <div className="border-b pb-4">
          <p className="font-semibold text-lg">{employee.employee_name}</p>
          <p className="text-sm text-muted-foreground">Employee ID: {employee.employee_id}</p>
        </div>

        {/* Period */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">PAY PERIOD START</p>
            <p className="font-semibold">{new Date(employee.week_start).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">PAY PERIOD END</p>
            <p className="font-semibold">{new Date(employee.week_end).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Hours Breakdown */}
        <div className="border-t border-b py-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Regular Hours ({employee.regular_hours.toFixed(2)})</span>
              <span className="font-semibold">${employee.regular_pay.toFixed(2)}</span>
            </div>
            {employee.overtime_hours > 0 && (
              <div className="flex justify-between">
                <span>
                  Overtime Hours ({employee.overtime_hours.toFixed(2)} @ {(employee.hourly_rate * 1.5).toFixed(2)}/hr)
                </span>
                <span className="font-semibold">${employee.overtime_pay.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center text-lg">
          <span className="font-bold">GROSS PAY</span>
          <span className="text-2xl font-bold">${employee.total_pay.toFixed(2)}</span>
        </div>

        {/* Footer */}
        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          <p>This is an official payroll record. Please retain for your records.</p>
        </div>
      </CardContent>
    </Card>
  )
}
