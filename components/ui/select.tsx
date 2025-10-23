import type * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"

export const Select = SelectPrimitive.Root
export const SelectGroup = SelectPrimitive.Group
export const SelectValue = SelectPrimitive.Value

export function SelectTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <SelectPrimitive.Trigger
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export function SelectContent({
  children,
  position = "popper",
  className,
}: { children: React.ReactNode; position?: "popper" | "item-aligned"; className?: string }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={`relative z-[100] max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-white dark:bg-slate-950 text-popover-foreground shadow-lg ${className || ""}`}
        position={position}
      >
        <SelectPrimitive.Viewport className="p-1 bg-white dark:bg-slate-950">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export function SelectItem({
  children,
  value,
  className,
}: { children: React.ReactNode; value: string; className?: string }) {
  return (
    <SelectPrimitive.Item
      value={value}
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className || ""}`}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}
