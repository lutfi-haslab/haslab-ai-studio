/**
 * MediaHistory Component
 * Display and manage generated media history
 */

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Download, 
  RefreshCw, 
  Trash2, 
  Eye,
  Calendar,
  Image as ImageIcon,
  Video
} from 'lucide-react'
import type { MediaGeneration } from '@/lib/repository/types'

interface MediaHistoryProps {
  items: MediaGeneration[]
  onRegenerate?: (item: MediaGeneration) => void
  onDelete?: (id: string) => void
  onView?: (item: MediaGeneration) => void
  onDownload?: (url: string, filename: string) => void
}

export function MediaHistory({
  items,
  onRegenerate,
  onDelete,
  onView,
  onDownload
}: MediaHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')

  const filteredItems = items.filter(item => {
    // Type filter
    if (filter !== 'all' && item.type !== filter) return false

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const itemDate = new Date(item.timestamp)
      const diffDays = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24))

      if (dateFilter === 'today' && diffDays > 0) return false
      if (dateFilter === 'week' && diffDays > 7) return false
      if (dateFilter === 'month' && diffDays > 30) return false
    }

    return true
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'image' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('image')}
        >
          <ImageIcon className="h-3 w-3 mr-1" />
          Images
        </Button>
        <Button
          variant={filter === 'video' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('video')}
        >
          <Video className="h-3 w-3 mr-1" />
          Videos
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        {['all', 'today', 'week', 'month'].map(period => (
          <Button
            key={period}
            variant={dateFilter === period ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDateFilter(period as any)}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Button>
        ))}
      </div>

      {/* History Grid */}
      <ScrollArea className="h-[500px]">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
            <p>No media generated yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredItems.map(item => (
              <Card key={item.id} className="overflow-hidden group">
                <div className="relative aspect-video bg-muted">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.prompt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Video className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {onView && (
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => onView(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onDownload && (
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => onDownload(item.url, `media-${item.id}.png`)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {onRegenerate && (
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => onRegenerate(item)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-sm line-clamp-2 font-medium">{item.prompt}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {item.model}
                    </Badge>
                    {item.style && (
                      <Badge variant="outline" className="text-xs">
                        {item.style}
                      </Badge>
                    )}
                    {item.usage && (
                      <Badge variant="outline" className="text-xs">
                        ${item.usage.cost.toFixed(4)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
