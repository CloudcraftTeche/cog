"use client"
import { useEffect, useState } from "react"
interface AnimatedProgressProps {
  value: number
  className?: string
  showPercentage?: boolean
  duration?: number
}
export function AnimatedProgress({
  value,
  className = "",
  showPercentage = true,
  duration = 1000,
}: AnimatedProgressProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [animatedWidth, setAnimatedWidth] = useState(0)
  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0)
      setAnimatedWidth(0)
      return
    }
    const startTime = Date.now()
    const startValue = displayValue
    const startWidth = animatedWidth
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.round(startValue + (value - startValue) * easeOutCubic)
      const currentWidth = startWidth + (value - startWidth) * easeOutCubic
      setDisplayValue(currentValue)
      setAnimatedWidth(currentWidth)
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [value, duration])
  return (
    <div className="space-y-2">
      {showPercentage && (
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Uploading...</span>
          <span className="text-slate-600 font-mono">{displayValue}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full h-3 overflow-hidden ${className}`}>
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${animatedWidth}%`,
            transition: "width 0.3s ease-out",
          }}
        />
      </div>
    </div>
  )
}
