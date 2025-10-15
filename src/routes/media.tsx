import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Image as ImageIcon,
  Wand2,
  Download,
  Copy,
  Share,
  RefreshCw,
  Upload,
  Palette,
  Sparkles
} from 'lucide-react'

export const Route = createFileRoute('/media')({
  component: GenerateMedia,
})

interface GeneratedImage {
  id: string
  prompt: string
  url: string
  style: string
  size: string
  timestamp: Date
}

function GenerateMedia() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState('realistic')
  const [selectedSize, setSelectedSize] = useState('1024x1024')
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([
    {
      id: '1',
      prompt: 'A futuristic cityscape at sunset with flying cars',
      url: '/api/placeholder/512/512',
      style: 'realistic',
      size: '1024x1024',
      timestamp: new Date()
    }
  ])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    
    // Simulate image generation
    setTimeout(() => {
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt,
        url: '/api/placeholder/512/512',
        style: selectedStyle,
        size: selectedSize,
        timestamp: new Date()
      }
      setGeneratedImages(prev => [newImage, ...prev])
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <ImageIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Generate Media</h1>
            <Badge variant="secondary" className="text-xs">Beta</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Create stunning images and media content using AI-powered generation
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-6xl mx-auto p-4 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Generation Panel */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Create New
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Describe what you want to create
                    </label>
                    <Textarea
                      placeholder="A serene mountain landscape with a crystal clear lake reflecting the snow-capped peaks..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Style
                    </label>
                    <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realistic">Realistic</SelectItem>
                        <SelectItem value="artistic">Artistic</SelectItem>
                        <SelectItem value="cartoon">Cartoon</SelectItem>
                        <SelectItem value="abstract">Abstract</SelectItem>
                        <SelectItem value="photography">Photography</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Size
                    </label>
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="512x512">Square (512×512)</SelectItem>
                        <SelectItem value="1024x1024">Large Square (1024×1024)</SelectItem>
                        <SelectItem value="1024x768">Landscape (1024×768)</SelectItem>
                        <SelectItem value="768x1024">Portrait (768×1024)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || isGenerating}
                      className="flex-1"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Generated Images Gallery */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium">Generated Images</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Palette className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isGenerating && (
                    <Card className="p-4">
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-3">
                        <div className="text-center">
                          <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Generating...</p>
                        </div>
                      </div>
                      <p className="text-sm text-foreground truncate">{prompt}</p>
                    </Card>
                  )}
                  
                  {generatedImages.map((image) => (
                    <Card key={image.id} className="p-4 group hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-muted rounded-lg mb-3 relative overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <ImageIcon className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <Button size="sm" variant="secondary">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="secondary">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="secondary">
                              <Share className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-foreground line-clamp-2">{image.prompt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">{image.style}</Badge>
                            <Badge variant="outline" className="text-xs">{image.size}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {image.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}