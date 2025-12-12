import * as React from "react"
import { cn } from "@/lib/utils"

interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  children: React.ReactNode
}

export function AuthCard({ title, description, children, className, ...props }: AuthCardProps) {
  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div 
        className={cn(
          "w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg ring-1 ring-black/5",
          className
        )} 
        {...props}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-congress-blue-900">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
