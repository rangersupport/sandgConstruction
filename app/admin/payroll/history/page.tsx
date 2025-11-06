import { getPayrollHistory } from "@/lib/actions/payroll-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, DollarSign, User } from "lucide-react"

export default async function PaymentHistoryPage() {
  const payrollHistory = await getPayrollHistory()

  const totalPaid = payrollHistory
    .filter((record: any) => record.fieldData?.total_pay)
    .reduce((sum: number, record: any) => sum + Number.parseFloat(record.fieldData.total_pay || 0), 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment History</h1>
          <p className="text-muted-foreground">View past payroll records and employee payment history</p>
        </div>
        <Link href="/admin/payroll">
          <Button variant="outline">Back to Payroll</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payroll Periods</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollHistory.length}</div>
            <p className="text-xs text-muted-foreground">Total records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees Paid</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(payrollHistory.map((r: any) => r.fieldData?.employee_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique employees</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          {payrollHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No payment history found</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Period Start</TableHead>
                    <TableHead>Period End</TableHead>
                    <TableHead className="text-right">Regular Hrs</TableHead>
                    <TableHead className="text-right">OT Hrs</TableHead>
                    <TableHead className="text-right">Total Hours</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollHistory.map((record: any, index: number) => {
                    const fieldData = record.fieldData || {}
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{fieldData.employee_name || "N/A"}</TableCell>
                        <TableCell>
                          {fieldData.week_start ? new Date(fieldData.week_start).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          {fieldData.week_end ? new Date(fieldData.week_end).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          {Number.parseFloat(fieldData.regular_hours || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {Number.parseFloat(fieldData.overtime_hours || 0) > 0 ? (
                            <Badge variant="secondary">
                              {Number.parseFloat(fieldData.overtime_hours || 0).toFixed(2)}
                            </Badge>
                          ) : (
                            "0.00"
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {Number.parseFloat(fieldData.total_hours || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ${Number.parseFloat(fieldData.total_pay || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge>{fieldData.status || "paid"}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
