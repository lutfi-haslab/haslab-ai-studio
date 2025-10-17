import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface StylePickerProps {
  value: string
  onChange: (id: string, prompt: string) => void
}

const styleOptions = [
  { id: 'photorealistic', label: 'Photorealistic', prompt: 'photorealistic, highly detailed, professional photography' },
  { id: 'artistic', label: 'Artistic', prompt: 'artistic, painterly, creative composition' },
  { id: 'anime', label: 'Anime', prompt: 'anime style, manga, Japanese animation' },
  { id: 'cartoon', label: 'Cartoon', prompt: 'cartoon style, animated, colorful' },
  { id: 'watercolor', label: 'Watercolor', prompt: 'watercolor painting, soft colors, artistic brushstrokes' },
  { id: 'oil-painting', label: 'Oil Painting', prompt: 'oil painting, classical art style, rich textures' },
  { id: 'digital-art', label: 'Digital Art', prompt: 'digital art, modern, clean lines, vibrant colors' },
  { id: 'sketch', label: 'Sketch', prompt: 'pencil sketch, hand-drawn, rough lines' },
  { id: 'minimalist', label: 'Minimalist', prompt: 'minimalist, clean, simple, elegant' },
]

export function StylePicker({ value, onChange }: StylePickerProps) {
  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">Art Style</Label>
      <Select
        value={value}
        onValueChange={(selectedId) => {
          const option = styleOptions.find(opt => opt.id === selectedId)
          if (option) {
            onChange(selectedId, option.prompt)
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Choose a style" />
        </SelectTrigger>
        <SelectContent>
          {styleOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
