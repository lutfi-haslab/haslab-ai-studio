import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface LightingPickerProps {
  value: string
  onChange: (id: string, prompt: string) => void
}

const lightingOptions = [
  { id: 'golden-hour', label: 'Golden Hour', prompt: 'golden hour lighting, warm sunset, magical atmosphere' },
  { id: 'dramatic', label: 'Dramatic', prompt: 'dramatic lighting, high contrast, moody shadows' },
  { id: 'soft', label: 'Soft', prompt: 'soft lighting, diffused, gentle shadows' },
  { id: 'neon', label: 'Neon', prompt: 'neon lighting, colorful, cyberpunk atmosphere' },
  { id: 'studio', label: 'Studio', prompt: 'studio lighting, professional, even illumination' },
  { id: 'candlelight', label: 'Candlelight', prompt: 'candlelight, warm, intimate atmosphere' },
  { id: 'backlit', label: 'Backlit', prompt: 'backlit, silhouette effect, rim lighting' },
  { id: 'moonlight', label: 'Moonlight', prompt: 'moonlight, cool tones, serene atmosphere' },
  { id: 'sunrise', label: 'Sunrise', prompt: 'sunrise lighting, fresh, hopeful atmosphere' },
]

export function LightingPicker({ value, onChange }: LightingPickerProps) {
  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">Lighting</Label>
      <Select
        value={value}
        onValueChange={(selectedId) => {
          const option = lightingOptions.find(opt => opt.id === selectedId)
          if (option) {
            onChange(selectedId, option.prompt)
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Choose lighting" />
        </SelectTrigger>
        <SelectContent>
          {lightingOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
