import * as React from "react"

export function Badge({ 
  children, 
  variant = "default",
  className 
}: { 
  children: React.ReactNode
  variant?: "default" | "secondary" | "destructive" | "outline"
  className?: string 
}) {
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"
  
  const variantStyles = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground"
  }
  
  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className || ''}`}>
      {children}
    </div>
  )
}
