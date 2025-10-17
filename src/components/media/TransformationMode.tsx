/**
 * TransformationMode Component
 * Image enhancement and restyle modes
 */

import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Palette, Wand2 } from 'lucide-react'

export type TransformMode = 'generate' | 'enhance' | 'restyle'

export interface RestyleOption {
  id: string
  label: string
  prompt: string
  description: string
}

export const restyleOptions: RestyleOption[] = [
  {
    id: 'formal',
    label: 'Formal Portrait',
    prompt: 'Transform into a professional, formal portrait photograph with business attire and studio lighting',
    description: 'Professional business look'
  },
  {
    id: 'anime',
    label: 'Anime Style',
    prompt: 'Transform into anime/manga illustration style with cel shading and vibrant colors',
    description: 'Japanese animation style'
  },
  {
    id: 'cartoon',
    label: 'Cartoon',
    prompt: 'Transform into a colorful cartoon illustration with simplified features and bold outlines',
    description: 'Playful cartoon aesthetic'
  },
  {
    id: 'artistic',
    label: 'Artistic Paint',
    prompt: 'Transform into an artistic oil painting with visible brushstrokes and rich textures',
    description: 'Classical art style'
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    prompt: 'Transform with cinematic color grading, film grain, and dramatic lighting',
    description: 'Movie-quality look'
  },
  {
    id: '3d-realistic',
    label: 'Realistic 3D',
    prompt: 'Transform into a photorealistic 3D render with ray-traced lighting',
    description: 'CGI realism'
  },
  {
    id: 'sketch',
    label: 'Sketch',
    prompt: 'Transform into a detailed pencil sketch with cross-hatching and shading',
    description: 'Hand-drawn appearance'
  },
  {
    id: 'fantasy',
    label: 'Fantasy Art',
    prompt: 'Transform into fantasy game-style concept art with magical atmosphere',
    description: 'Epic game art style'
  }
]

interface TransformationModeProps {
  mode: TransformMode
  onModeChange: (mode: TransformMode) => void
  restyleOption?: string
  onRestyleChange?: (optionId: string, prompt: string) => void
}

export function TransformationMode({
  mode,
  onModeChange,
  restyleOption,
  onRestyleChange
}: TransformationModeProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-3 block">Generation Mode</Label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onModeChange('generate')}
            className={`p-3 rounded-lg border-2 transition-all ${
              mode === 'generate'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <Wand2 className="h-5 w-5 mx-auto mb-1 text-purple-500" />
            <p className="text-xs font-medium">Generate</p>
            <p className="text-xs text-muted-foreground">New image</p>
          </button>

          <button
            onClick={() => onModeChange('enhance')}
            className={`p-3 rounded-lg border-2 transition-all ${
              mode === 'enhance'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <Sparkles className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-xs font-medium">Enhance</p>
            <p className="text-xs text-muted-foreground">Upscale & fix</p>
          </button>

          <button
            onClick={() => onModeChange('restyle')}
            className={`p-3 rounded-lg border-2 transition-all ${
              mode === 'restyle'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <Palette className="h-5 w-5 mx-auto mb-1 text-pink-500" />
            <p className="text-xs font-medium">Restyle</p>
            <p className="text-xs text-muted-foreground">Transform</p>
          </button>
        </div>
      </div>

      {mode === 'restyle' && onRestyleChange && (
        <div className="border-t pt-4">
          <Label className="text-sm font-medium mb-3 block">Restyle Options</Label>
          <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2">
            {restyleOptions.map(option => (
              <button
                key={option.id}
                onClick={() => onRestyleChange(option.id, option.prompt)}
                className={`p-2 rounded-lg border text-left transition-all ${
                  restyleOption === option.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground hover:bg-accent'
                }`}
              >
                <p className="text-sm font-medium mb-0.5">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'enhance' && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Enhance mode:</strong> Improve quality through upscaling, denoising, and sharpening.
          </p>
        </div>
      )}
    </div>
  )
}
