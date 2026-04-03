'use client'

import { Check, Camera, MapPin, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { label: 'Produto', icon: Tag },
  { label: 'Fotos', icon: Camera },
  { label: 'Localização', icon: MapPin },
]

interface StepIndicatorProps {
  currentStep: number // 1-based
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="relative flex items-center justify-between w-full max-w-sm mx-auto">
      {/* connecting line */}
      <div className="absolute inset-x-0 top-5 h-px bg-border mx-10" />
      <div
        className="absolute top-5 h-px bg-primary transition-all duration-700 ease-out mx-10"
        style={{
          left: 0,
          width: `calc(${((currentStep - 1) / (STEPS.length - 1)) * 100}% - 0px)`,
          marginLeft: '2.5rem',
          marginRight: '2.5rem',
          maxWidth: 'calc(100% - 5rem)',
        }}
      />

      {STEPS.map((step, idx) => {
        const stepNum = idx + 1
        const isDone = stepNum < currentStep
        const isActive = stepNum === currentStep
        const Icon = step.icon

        return (
          <div key={step.label} className="relative flex flex-col items-center gap-2 z-10">
            {/* circle */}
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                isDone &&
                  'bg-primary border-primary text-primary-foreground',
                isActive &&
                  'bg-accent border-primary text-primary shadow-[0_0_16px_2px_hsl(var(--primary)/0.35)]',
                !isDone &&
                  !isActive &&
                  'bg-card border-border text-muted-foreground',
              )}
            >
              {isDone ? (
                <Check className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
            </div>

            {/* label */}
            <span
              className={cn(
                'text-xs font-medium tracking-wide transition-colors duration-300',
                isActive ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}