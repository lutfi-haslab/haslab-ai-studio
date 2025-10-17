/**
 * StylePicker Component
 * Visual style selector with categories and previews
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight } from 'lucide-react'

export interface StyleCategory {
  name: string
  styles: StyleOption[]
}

export interface StyleOption {
  id: string
  label: string
  prompt: string
  color?: string
}

const styleCategories: StyleCategory[] = [
  {
    name: 'Photography',
    styles: [
      { id: 'portrait', label: 'Portrait', prompt: ', professional portrait photography, shallow depth of field', color: 'bg-blue-500' },
      { id: 'landscape', label: 'Landscape', prompt: ', breathtaking landscape photography, golden hour lighting', color: 'bg-green-500' },
      { id: 'macro', label: 'Macro', prompt: ', macro photography, extreme close-up, highly detailed', color: 'bg-purple-500' },
      { id: 'night', label: 'Night', prompt: ', night photography, long exposure, city lights', color: 'bg-indigo-900' },
      { id: 'hdr', label: 'HDR', prompt: ', HDR photography, high dynamic range, vivid colors', color: 'bg-orange-500' },
    ]
  },
  {
    name: 'Artistic',
    styles: [
      { id: 'watercolor', label: 'Watercolor', prompt: ', watercolor painting, soft colors, flowing brushstrokes', color: 'bg-cyan-300' },
      { id: 'oil-paint', label: 'Oil Paint', prompt: ', oil painting style, classical art, textured brushstrokes', color: 'bg-amber-700' },
      { id: 'sketch', label: 'Sketch', prompt: ', pencil sketch, hand-drawn, artistic lines', color: 'bg-gray-500' },
      { id: 'digital-art', label: 'Digital Art', prompt: ', digital illustration, vibrant colors, modern art', color: 'bg-pink-500' },
    ]
  },
  {
    name: 'Character',
    styles: [
      { id: 'anime', label: 'Anime', prompt: ', anime style, manga art, cel shading', color: 'bg-rose-400' },
      { id: '3d-render', label: '3D Render', prompt: ', 3D render, Pixar style, CGI animation', color: 'bg-blue-600' },
      { id: 'pixar', label: 'Pixar', prompt: ', Pixar animation style, colorful, expressive characters', color: 'bg-yellow-500' },
      { id: 'cyberpunk', label: 'Cyberpunk', prompt: ', cyberpunk style, neon lights, futuristic technology', color: 'bg-purple-700' },
    ]
  },
  {
    name: 'Scene',
    styles: [
      { id: 'realistic', label: 'Realistic', prompt: ', photorealistic, highly detailed, 8K resolution', color: 'bg-stone-600' },
      { id: 'dreamy', label: 'Dreamy', prompt: ', dreamy atmosphere, soft focus, ethereal mood', color: 'bg-violet-300' },
      { id: 'minimalist', label: 'Minimalist', prompt: ', minimalist design, clean composition, simple colors', color: 'bg-slate-300' },
      { id: 'neon-noir', label: 'Neon Noir', prompt: ', neon noir style, dark shadows, vibrant neon accents', color: 'bg-fuchsia-900' },
    ]
  }
]

interface StylePickerProps {
  value?: string
  onChange: (styleId: string, prompt: string) => void
}

export function StylePicker({ value, onChange }: StylePickerProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Photography'])
  )

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Style Categories</Label>
      <ScrollArea className="h-[300px] border rounded-lg p-2">
        <div className="space-y-2">
          {styleCategories.map(category => (
            <Collapsible
              key={category.name}
              open={expandedCategories.has(category.name)}
              onOpenChange={() => toggleCategory(category.name)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-9 px-2"
                >
                  <span className="font-medium text-sm">{category.name}</span>
                  {expandedCategories.has(category.name) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-1 pl-2 space-y-1">
                {category.styles.map(style => (
                  <button
                    key={style.id}
                    onClick={() => onChange(style.id, style.prompt)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                      value === style.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${style.color || 'bg-gray-400'}`} />
                    <span>{style.label}</span>
                  </button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
      {value && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange('', '')}
          className="w-full"
        >
          Clear Style
        </Button>
      )}
    </div>
  )
}
