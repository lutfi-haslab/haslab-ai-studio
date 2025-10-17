/**
 * LightingPicker Component
 * Lighting mood selector with visual presets
 */

import { Label } from '@/components/ui/label'
import { Sun, CloudRain, Sunrise, Zap, Moon, Lightbulb } from 'lucide-react'

export interface LightingOption {
  id: string
  label: string
  prompt: string
  icon: any
  color: string
}

const lightingOptions: LightingOption[] = [
  {
    id: 'studio',
    label: 'Studio',
    prompt: ', professional studio lighting, three-point lighting',
    icon: Lightbulb,
    color: 'text-yellow-500'
  },
  {
    id: 'ambient',
    label: 'Ambient',
    prompt: ', soft ambient lighting, diffused light',
    icon: CloudRain,
    color: 'text-blue-400'
  },
  {
    id: 'natural',
    label: 'Natural',
    prompt: ', natural outdoor lighting, daylight',
    icon: Sun,
    color: 'text-orange-400'
  },
  {
    id: 'golden-hour',
    label: 'Golden Hour',
    prompt: ', golden hour lighting, warm sunset glow',
    icon: Sunrise,
    color: 'text-amber-500'
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    prompt: ', cinematic dramatic lighting, high contrast',
    icon: Zap,
    color: 'text-purple-500'
  },
  {
    id: 'backlit',
    label: 'Backlit',
    prompt: ', backlit rim lighting, silhouette effect',
    icon: Moon,
    color: 'text-indigo-400'
  }
]

interface LightingPickerProps {
  value?: string
  onChange: (lightingId: string, prompt: string) => void
}

export function LightingPicker({ value, onChange }: LightingPickerProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Lighting & Mood</Label>
      <div className="grid grid-cols-2 gap-2">
        {lightingOptions.map(option => {
          const Icon = option.icon
          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id, option.prompt)}
              className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                value === option.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground hover:bg-accent'
              }`}
            >
              <Icon className={`h-5 w-5 ${option.color}`} />
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
