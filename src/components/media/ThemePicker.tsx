import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ThemePickerProps {
  value: string
  onChange: (id: string, prompt: string) => void
}

const themeOptions = [
  { id: 'nature', label: 'Nature', prompt: 'nature theme, natural elements, organic' },
  { id: 'urban', label: 'Urban', prompt: 'urban theme, cityscape, modern architecture' },
  { id: 'fantasy', label: 'Fantasy', prompt: 'fantasy theme, magical, mythical elements' },
  { id: 'sci-fi', label: 'Sci-Fi', prompt: 'science fiction, futuristic, high-tech' },
  { id: 'vintage', label: 'Vintage', prompt: 'vintage theme, retro, nostalgic' },
  { id: 'minimal', label: 'Minimal', prompt: 'minimal theme, clean, simple' },
  { id: 'dark', label: 'Dark', prompt: 'dark theme, moody, dramatic lighting' },
  { id: 'bright', label: 'Bright', prompt: 'bright theme, vibrant, cheerful' },
  { id: 'monochrome', label: 'Monochrome', prompt: 'monochrome theme, black and white, grayscale' },
]

export function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">Theme</Label>
      <Select
        value={value}
        onValueChange={(selectedId) => {
          const option = themeOptions.find(opt => opt.id === selectedId)
          if (option) {
            onChange(selectedId, option.prompt)
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Choose a theme" />
        </SelectTrigger>
        <SelectContent>
          {themeOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
