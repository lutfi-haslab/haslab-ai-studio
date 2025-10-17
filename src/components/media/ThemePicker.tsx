/**
 * ThemePicker Component
 * Visual theme selector with preview chips
 */

import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export interface Theme {
  id: string
  label: string
  prompt: string
  gradient: string
  description: string
}

const themes: Theme[] = [
  {
    id: 'soft-light',
    label: 'Soft Light',
    prompt: ', soft natural lighting, gentle shadows',
    gradient: 'from-amber-100 to-amber-50',
    description: 'Gentle, natural lighting'
  },
  {
    id: 'dark-film',
    label: 'Dark Film',
    prompt: ', dark moody atmosphere, film noir lighting',
    gradient: 'from-slate-900 to-slate-700',
    description: 'Cinematic dark mood'
  },
  {
    id: 'cool-tone',
    label: 'Cool Tone',
    prompt: ', cool color temperature, blue tones',
    gradient: 'from-blue-400 to-cyan-300',
    description: 'Cool, calm colors'
  },
  {
    id: 'warm-glow',
    label: 'Warm Glow',
    prompt: ', warm golden glow, sunset colors',
    gradient: 'from-orange-400 to-yellow-300',
    description: 'Warm, inviting atmosphere'
  },
  {
    id: 'monochrome',
    label: 'Monochrome',
    prompt: ', black and white, high contrast',
    gradient: 'from-gray-900 to-gray-100',
    description: 'Classic B&W'
  },
  {
    id: 'vivid-pop',
    label: 'Vivid Pop',
    prompt: ', vibrant saturated colors, pop art style',
    gradient: 'from-fuchsia-500 via-purple-500 to-indigo-500',
    description: 'Bold, vibrant colors'
  }
]

interface ThemePickerProps {
  value?: string
  onChange: (themeId: string, prompt: string) => void
}

export function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Color Theme</Label>
      <div className="grid grid-cols-2 gap-2">
        {themes.map(theme => (
          <button
            key={theme.id}
            onClick={() => onChange(theme.id, theme.prompt)}
            className={`relative p-3 rounded-lg border-2 transition-all ${
              value === theme.id
                ? 'border-primary shadow-md'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <div className={`w-full h-8 rounded bg-gradient-to-r ${theme.gradient} mb-2`} />
            <div className="text-left">
              <p className="text-sm font-medium">{theme.label}</p>
              <p className="text-xs text-muted-foreground">{theme.description}</p>
            </div>
            {value === theme.id && (
              <Badge className="absolute top-2 right-2" variant="default">
                ✓
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
