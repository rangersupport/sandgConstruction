import * as React from "react"

export function Alert({ children, variant, className }: { 
  children: React.ReactNode
  variant?: "default" | "destructive"
  className?: string 
}) {
  const baseStyles = "relative w-full rounded-lg border p-4"
  const variantStyles = variant === "destructive" 
    ? "border-red-500 text-red-600" 
    : "bg-background text-foreground"
  
  return (
    <div role="alert" className={`${baseStyles} ${variantStyles} ${className || ''}`}>
      {children}
    </div>
  )
}

export function AlertDescription({ children, className }: { 
  children: React.ReactNode
  className?: string 
}) {
  return <div className={`text-sm ${className || ''}`}>{children}</div>
}