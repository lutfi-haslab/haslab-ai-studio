import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'

export type TransformMode = 'generate' | 'enhance' | 'restyle'

interface TransformationModeProps {
  mode: TransformMode
  onModeChange: (mode: TransformMode) => void
  restyleOption: string
  onRestyleChange: (id: string, prompt: string) => void
}

const modeOptions = [
  { id: 'generate', label: 'Generate New', description: 'Create new images from scratch' },
  { id: 'enhance', label: 'Enhance', description: 'Improve existing images' },
  { id: 'restyle', label: 'Restyle', description: 'Transform existing images' },
] as const

const restyleOptions = [
  { id: 'to-oil-painting', label: 'Oil Painting', prompt: 'convert to oil painting style, classical art, rich textures and colors' },
  { id: 'to-watercolor', label: 'Watercolor', prompt: 'convert to watercolor style, soft colors, artistic brushstrokes' },
  { id: 'to-sketch', label: 'Pencil Sketch', prompt: 'convert to pencil sketch style, hand-drawn, rough lines' },
  { id: 'to-anime', label: 'Anime Style', prompt: 'convert to anime style, manga, Japanese animation aesthetic' },
  { id: 'to-cyberpunk', label: 'Cyberpunk', prompt: 'convert to cyberpunk style, neon, futuristic, high-tech' },
  { id: 'to-vintage', label: 'Vintage Photo', prompt: 'convert to vintage photograph, retro, nostalgic' },
]

export function TransformationMode({ mode, onModeChange, restyleOption, onRestyleChange }: TransformationModeProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">Transformation Mode</Label>
        <div className="grid grid-cols-3 gap-2">
          {modeOptions.map((option) => (
            <Card
              key={option.id}
              className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                mode === option.id
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onModeChange(option.id as TransformMode)}
            >
              <div className="text-sm font-medium">{option.label}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {option.description}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {mode === 'restyle' && (
        <div>
          <Label className="text-sm font-medium mb-2 block">Restyle Option</Label>
          <Select
            value={restyleOption}
            onValueChange={(selectedId) => {
              const option = restyleOptions.find(opt => opt.id === selectedId)
              if (option) {
                onRestyleChange(selectedId, option.prompt)
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose restyle option" />
            </SelectTrigger>
            <SelectContent>
              {restyleOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
