import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'

interface GeneratedMedia {
  id: string
  type: 'image' | 'video'
  prompt: string
  url: string
  model?: string
  response?: string
  timestamp: Date
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    imageTokens?: number
    inputImages?: number
    outputImages?: number
    cost: number
  }
  style?: string
  quality?: string
  lighting?: string
  theme?: string
  mode?: string
}

interface MediaHistoryProps {
  media: GeneratedMedia[]
  onSelect: (media: GeneratedMedia) => void
}

export function MediaHistory({ media, onSelect }: MediaHistoryProps) {
  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Eye className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No History</h3>
        <p className="text-sm text-muted-foreground">
          Generated media will appear here for easy reference.
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-4 w-4" />
          <h3 className="font-semibold">Generation History</h3>
          <Badge variant="secondary" className="ml-auto">
            {media.length}
          </Badge>
        </div>

        {media.map((item) => (
          <Card key={item.id} className="p-3 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onSelect(item)}>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <img
                  src={item.url}
                  alt={item.prompt}
                  className="w-12 h-12 object-cover rounded-md"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm line-clamp-2 mb-1">
                  {item.prompt}
                </p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.mode && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {item.mode}
                    </Badge>
                  )}
                  {item.style && (
                    <Badge variant="secondary" className="text-xs">
                      {item.style}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                  {item.usage && (
                    <span className="font-mono">
                      ${item.usage.cost.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}
