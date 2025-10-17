import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ENV from '@/lib/env'
import {
  Image as ImageIcon,
  Wand2,
  Download,
  Copy,
  RefreshCw,
  Upload,
  Sparkles,
  X,
  Eye
} from 'lucide-react'

export const Route = createFileRoute('/media/backup')({
  component: GenerateMedia,
})

interface UsageMetrics {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  imageTokens?: number
  inputImages?: number
  outputImages?: number
  cost: number
}

interface GeneratedImage {
  id: string
  prompt: string
  url: string
  type: 'generated' | 'analyzed'
  model?: string
  response?: string
  timestamp: Date
  usage?: UsageMetrics
  style?: string
  quality?: string
  lighting?: string
}

function GenerateMedia() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'generate' | 'analyze'>('generate')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  
  // Style helpers
  const [selectedStyle, setSelectedStyle] = useState('none')
  const [selectedQuality, setSelectedQuality] = useState('standard')
  const [selectedLighting, setSelectedLighting] = useState('none')

  const styles = {
    none: '',
    realistic: ', photorealistic, highly detailed, 8K resolution',
    anime: ', anime style, manga art, vibrant colors',
    cartoon: ', cartoon style, colorful, playful',
    '3d-render': ', 3D render, Pixar style, CGI',
    'oil-painting': ', oil painting style, classical art, textured brushstrokes',
    watercolor: ', watercolor painting, soft colors, artistic',
    sketch: ', pencil sketch, hand-drawn, artistic',
    'pixel-art': ', pixel art, retro gaming style, 8-bit',
    cyberpunk: ', cyberpunk style, neon lights, futuristic',
    fantasy: ', fantasy art, magical, ethereal',
  }

  const qualities = {
    standard: '',
    'high-detail': ', extremely detailed, intricate details, masterpiece',
    'ultra-hd': ', ultra HD, 8K, professional photography',
    cinematic: ', cinematic lighting, film grain, movie quality',
  }

  const lighting = {
    none: '',
    'golden-hour': ', golden hour lighting, warm sunset glow',
    'soft-studio': ', soft studio lighting, professional',
    dramatic: ', dramatic lighting, high contrast',
    'neon': ', neon lighting, vibrant colors',
    'natural': ', natural lighting, outdoor daylight',
  }

  // Gemini 2.5 Flash Image Preview Pricing
  const PRICING = {
    INPUT_TOKEN_COST: 0.30 / 1_000_000,    // $0.30 per 1M tokens
    OUTPUT_TOKEN_COST: 2.50 / 1_000_000,   // $2.50 per 1M tokens
    INPUT_IMAGE_COST: 1.238 / 1000,        // $1.238 per 1K images
    OUTPUT_IMAGE_COST: 0.03 / 1000         // $0.03 per 1K images
  }

  const calculateCost = (usage: any): UsageMetrics => {
    const promptTokens = usage.prompt_tokens || 0
    const completionTokens = usage.completion_tokens || 0
    const imageTokens = usage.completion_tokens_details?.image_tokens || 0
    const inputImages = activeTab === 'analyze' && uploadedImage ? 1 : 0
    const outputImages = imageTokens > 0 ? 1 : 0

    const tokenCost = (promptTokens * PRICING.INPUT_TOKEN_COST) + 
                     (completionTokens * PRICING.OUTPUT_TOKEN_COST)
    const imageCost = (inputImages * PRICING.INPUT_IMAGE_COST) + 
                     (outputImages * PRICING.OUTPUT_IMAGE_COST)
    
    return {
      promptTokens,
      completionTokens,
      totalTokens: usage.total_tokens || 0,
      imageTokens,
      inputImages,
      outputImages,
      cost: tokenCost + imageCost
    }
  }

  const totalMetrics = generatedImages.reduce(
    (acc, img) => {
      if (img.usage) {
        return {
          totalTokens: acc.totalTokens + img.usage.totalTokens,
          totalCost: acc.totalCost + img.usage.cost,
          totalImages: acc.totalImages + (img.usage.outputImages || 0)
        }
      }
      return acc
    },
    { totalTokens: 0, totalCost: 0, totalImages: 0 }
  )

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setUploadedImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    
    try {
      if (!ENV.OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not found. Please add VITE_OPENROUTER_KEY to your .env file')
      }

      const modelName = 'google/gemini-2.5-flash-image-preview'
      
      // Enhance prompt with style modifiers
      const enhancedPrompt = prompt + 
        (styles[selectedStyle as keyof typeof styles] || '') + 
        (qualities[selectedQuality as keyof typeof qualities] || '') + 
        (lighting[selectedLighting as keyof typeof lighting] || '')

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ENV.OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{
            role: 'user',
            content: enhancedPrompt
          }]
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to generate image')
      }

      const data = await response.json()
      console.log('API Response:', data)
      
      // Extract image URL from response - Gemini returns images in a different format
      const imageUrl = data.choices[0]?.message?.images?.[0]?.image_url?.url || 
                       data.choices[0]?.message?.content || ''
      
      if (!imageUrl) {
        throw new Error('No image URL in response')
      }

      const usage = calculateCost(data.usage)

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt,
        url: imageUrl,
        type: 'generated',
        model: modelName,
        timestamp: new Date(),
        usage,
        style: selectedStyle !== 'none' ? selectedStyle : undefined,
        quality: selectedQuality !== 'standard' ? selectedQuality : undefined,
        lighting: selectedLighting !== 'none' ? selectedLighting : undefined
      }
      setGeneratedImages(prev => [newImage, ...prev])
      setPrompt('')
    } catch (error: any) {
      console.error('Image generation error:', error)
      alert(error.message || 'Failed to generate image')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnalyzeImage = async () => {
    if (!uploadedImage || !prompt.trim()) return
    
    setIsGenerating(true)
    
    try {
      if (!ENV.OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not found')
      }

      const response = await fetch('https://api.openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ENV.OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp:free',
          messages: [{
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: uploadedImage
                }
              }
            ]
          }]
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to analyze image')
      }

      const data = await response.json()
      const analysisResult = data.choices[0]?.message?.content || ''
      const usage = calculateCost(data.usage)

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt,
        url: uploadedImage,
        type: 'analyzed',
        model: 'google/gemini-2.0-flash-exp',
        response: analysisResult,
        timestamp: new Date(),
        usage
      }
      setGeneratedImages(prev => [newImage, ...prev])
      setPrompt('')
    } catch (error: any) {
      console.error('Image analysis error:', error)
      alert(error.message || 'Failed to analyze image')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = (url: string, filename?: string) => {
    if (url.startsWith('data:')) {
      // For base64 data URLs
      const link = document.createElement('a')
      link.href = url
      link.download = filename || `generated-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // For regular URLs
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = filename || `generated-${Date.now()}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(blobUrl)
        })
        .catch(err => {
          console.error('Download failed:', err)
          alert('Failed to download image')
        })
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <ImageIcon className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">AI Media Studio</h1>
              <Badge variant="secondary" className="text-xs">Gemini 2.5 Flash</Badge>
            </div>
            {generatedImages.length > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{totalMetrics.totalImages} images</Badge>
                  <Badge variant="outline">{totalMetrics.totalTokens.toLocaleString()} tokens</Badge>
                  <Badge variant="default" className="font-mono">
                    ${totalMetrics.totalCost.toFixed(4)}
                  </Badge>
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Generate or analyze images with Gemini 2.5 Flash Image Preview • 32K context
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-6xl mx-auto p-4 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Control Panel */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-4">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'generate' | 'analyze')}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="generate">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate
                    </TabsTrigger>
                    <TabsTrigger value="analyze">
                      <Eye className="h-4 w-4 mr-2" />
                      Analyze
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Generate Tab */}
                  <TabsContent value="generate" className="space-y-4 mt-0">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Describe your image
                      </label>
                      <Textarea
                        placeholder="A serene mountain landscape with a crystal clear lake..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-[100px] resize-none"
                      />
                    </div>

                    {/* Style Helpers */}
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Style
                        </label>
                        <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="realistic">Realistic</SelectItem>
                            <SelectItem value="anime">Anime</SelectItem>
                            <SelectItem value="cartoon">Cartoon</SelectItem>
                            <SelectItem value="3d-render">3D Render</SelectItem>
                            <SelectItem value="oil-painting">Oil Painting</SelectItem>
                            <SelectItem value="watercolor">Watercolor</SelectItem>
                            <SelectItem value="sketch">Sketch</SelectItem>
                            <SelectItem value="pixel-art">Pixel Art</SelectItem>
                            <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                            <SelectItem value="fantasy">Fantasy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Quality
                        </label>
                        <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select quality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="high-detail">High Detail</SelectItem>
                            <SelectItem value="ultra-hd">Ultra HD</SelectItem>
                            <SelectItem value="cinematic">Cinematic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Lighting
                        </label>
                        <Select value={selectedLighting} onValueChange={setSelectedLighting}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select lighting" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="golden-hour">Golden Hour</SelectItem>
                            <SelectItem value="soft-studio">Soft Studio</SelectItem>
                            <SelectItem value="dramatic">Dramatic</SelectItem>
                            <SelectItem value="neon">Neon</SelectItem>
                            <SelectItem value="natural">Natural</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Enhanced Prompt Preview */}
                    {(selectedStyle !== 'none' || selectedQuality !== 'standard' || selectedLighting !== 'none') && prompt && (
                      <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1 font-medium">Enhanced Prompt:</p>
                        <p className="text-xs text-foreground font-mono">
                          {prompt}
                          <span className="text-blue-500">
                            {styles[selectedStyle as keyof typeof styles]}
                            {qualities[selectedQuality as keyof typeof qualities]}
                            {lighting[selectedLighting as keyof typeof lighting]}
                          </span>
                        </p>
                      </div>
                    )}

                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>Pricing:</strong> $0.30/M input • $2.50/M output • $1.238/K input imgs • $0.03/K output imgs
                      </p>
                    </div>

                    <Button
                      onClick={handleGenerateImage}
                      disabled={!prompt.trim() || isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate Image
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  {/* Analyze Tab */}
                  <TabsContent value="analyze" className="space-y-4 mt-0">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Upload Image
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      {uploadedImage ? (
                        <div className="relative">
                          <img 
                            src={uploadedImage} 
                            alt="Uploaded" 
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={() => setUploadedImage(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full h-48 border-dashed"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="text-center">
                            <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium">Click to upload</p>
                            <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG, WebP</p>
                          </div>
                        </Button>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        What would you like to know?
                      </label>
                      <Textarea
                        placeholder="Describe this image in detail, identify objects, explain what's happening..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-[100px] resize-none"
                      />
                    </div>

                    <Button
                      onClick={handleAnalyzeImage}
                      disabled={!uploadedImage || !prompt.trim() || isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Analyze Image
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground">
                      Using Gemini 2.0 Flash vision model
                    </p>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>

            {/* Results Gallery */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Results</h3>
                <p className="text-sm text-muted-foreground">
                  {generatedImages.length} {generatedImages.length === 1 ? 'item' : 'items'}
                </p>
              </div>

              <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isGenerating && (
                    <Card className="p-4">
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-3">
                        <div className="text-center">
                          <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {activeTab === 'generate' ? 'Generating...' : 'Analyzing...'}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-foreground truncate">{prompt}</p>
                    </Card>
                  )}
                  
                  {generatedImages.map((image) => (
                    <Card key={image.id} className="p-4 group hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-muted rounded-lg mb-3 relative overflow-hidden">
                        <img 
                          src={image.url} 
                          alt={image.prompt}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="24"%3EImage%3C/text%3E%3C/svg%3E'
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => handleDownload(image.url)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => handleCopy(image.response || image.url)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-foreground line-clamp-2 font-medium">{image.prompt}</p>
                        {image.response && (
                          <div className="mt-2 p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1 font-medium">Analysis:</p>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{image.response}</p>
                          </div>
                        )}
                        {/* Usage Metrics */}
                        {image.usage && (
                          <div className="p-2 bg-muted/50 rounded-lg space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Tokens:</span>
                              <span className="font-mono">{image.usage.totalTokens.toLocaleString()}</span>
                            </div>
                            {image.usage.imageTokens && image.usage.imageTokens > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Image tokens:</span>
                                <span className="font-mono">{image.usage.imageTokens.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-xs border-t border-border pt-1">
                              <span className="text-muted-foreground font-medium">Cost:</span>
                              <span className="font-mono font-medium text-primary">${image.usage.cost.toFixed(4)}</span>
                            </div>
                          </div>
                        )}

                        {/* Style Tags */}
                        {image.type === 'generated' && (image.style || image.quality || image.lighting) && (
                          <div className="flex flex-wrap gap-1">
                            {image.style && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {image.style.replace('-', ' ')}
                              </Badge>
                            )}
                            {image.quality && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {image.quality.replace('-', ' ')}
                              </Badge>
                            )}
                            {image.lighting && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {image.lighting.replace('-', ' ')} lighting
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <Badge variant={image.type === 'generated' ? 'default' : 'secondary'} className="text-xs">
                            {image.type === 'generated' ? 'Generated' : 'Analyzed'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {image.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        
                        {/* Action Buttons - Always Visible */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleDownload(image.url, `${image.type}-${image.id}.png`)}
                          >
                            <Download className="h-3 w-3 mr-2" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy(image.response || image.prompt)}
                          >
                            <Copy className="h-3 w-3 mr-2" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {generatedImages.length === 0 && !isGenerating && (
                    <div className="col-span-2 text-center py-12">
                      <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No images yet</h3>
                      <p className="text-sm text-muted-foreground">
                        {activeTab === 'generate' 
                          ? 'Create your first AI-generated image'
                          : 'Upload an image to analyze it'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

