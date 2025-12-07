"use client"
import { cn } from "@/lib/utils"
import { GraduationCap, BookOpen, Users, BarChart3 } from "lucide-react"
interface LoadingProps {
  variant?: "default" | "card" | "page" | "skeleton"
  size?: "sm" | "md" | "lg"
  className?: string
}
export function Loading({ variant = "default", size = "md", className }: LoadingProps) {
  if (variant === "skeleton") {
    return <LoadingSkeleton size={size} className={className} />
  }
  if (variant === "card") {
    return <LoadingCard size={size} className={className} />
  }
  if (variant === "page") {
    return <LoadingPage className={className} />
  }
  return <LoadingSpinner size={size} className={className} />
}
function LoadingSpinner({ size, className }: { size: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-orange-500", sizeClasses[size])}
      />
    </div>
  )
}
function LoadingCard({ size, className }: { size: "sm" | "md" | "lg"; className?: string }) {
  const heightClasses = {
    sm: "h-32",
    md: "h-48",
    lg: "h-64",
  }
  return (
    <div className={cn("bg-white rounded-xl shadow-lg border-0 overflow-hidden", heightClasses[size], className)}>
      <div className="animate-pulse">
        <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-full bg-[length:200%_100%] animate-shimmer" />
      </div>
    </div>
  )
}
function LoadingSkeleton({ size, className }: { size: "sm" | "md" | "lg"; className?: string }) {
  const itemCount = size === "sm" ? 3 : size === "md" ? 5 : 8
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full bg-[length:200%_100%] animate-shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer" />
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 bg-[length:200%_100%] animate-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
function LoadingPage({ className }: { className?: string }) {
  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center", className)}>
      <div className="text-center space-y-8">
        {}
        <div className="relative">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center animate-pulse">
            <GraduationCap className="h-12 w-12 text-white animate-bounce" />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-orange-200 rounded-2xl animate-ping" />
        </div>
        {}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 animate-pulse">Loading Dashboard</h2>
          <p className="text-gray-600 animate-pulse">Please wait while we prepare your content...</p>
        </div>
        {}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-loading-bar" />
          </div>
        </div>
        {}
        <div className="flex justify-center space-x-8">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center animate-float">
            <BookOpen className="h-6 w-6 text-blue-500" />
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center animate-float-delay-1">
            <Users className="h-6 w-6 text-green-500" />
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center animate-float-delay-2">
            <BarChart3 className="h-6 w-6 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  )
}
export function DashboardCardLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg border-0 overflow-hidden h-32">
          <div className="animate-pulse h-full">
            <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-full bg-[length:200%_100%] animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  )
}
export function TableLoading() {
  return (
    <div className="bg-white rounded-xl shadow-lg border-0 overflow-hidden">
      <div className="p-6 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full bg-[length:200%_100%] animate-shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer" />
                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-2/3 bg-[length:200%_100%] animate-shimmer" />
              </div>
              <div className="w-20 h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
