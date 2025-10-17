import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StylePicker } from '@/components/media/StylePicker'
import { ThemePicker } from '@/components/media/ThemePicker'
import { LightingPicker } from '@/components/media/LightingPicker'
import { TransformationMode, type TransformMode } from '@/components/media/TransformationMode'
import { MediaHistory } from '@/components/media/MediaHistory'
import ENV from '@/lib/env'
import {
  Image as ImageIcon,
  Video,
  Wand2,
  Download,
  RefreshCw,
  Upload,
  Sparkles,
  X,
  Eye,
  Heart,
  Share2,
  Zap
} from 'lucide-react'

export const Route = createFileRoute('/media-enhanced')({
  component: GenerateMediaEnhanced,
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

interface GeneratedMedia {
  id: string
  type: 'image' | 'video'
  prompt: string
  url: string
  model?: string
  response?: string
  timestamp: Date
  usage?: UsageMetrics
  style?: string
  quality?: string
  lighting?: string
  theme?: string
  mode?: TransformMode
}

function GenerateMediaEnhanced() {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [generatedMedia, setGeneratedMedia] = useState<GeneratedMedia[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [imageCount, setImageCount] = useState<1 | 2 | 3 | 4>(1)
  
  // Transformation & Style Settings
  const [transformMode, setTransformMode] = useState<TransformMode>('generate')
  const [selectedStyle, setSelectedStyle] = useState<string>('')
  const [stylePrompt, setStylePrompt] = useState<string>('')
  const [selectedTheme, setSelectedTheme] = useState<string>('')
  const [themePrompt, setThemePrompt] = useState<string>('')
  const [selectedLighting, setSelectedLighting] = useState<string>('')
  const [lightingPrompt, setLightingPrompt] = useState<string>('')
  const [restyleOption, setRestyleOption] = useState<string>('')
  const [restylePrompt, setRestylePrompt] = useState<string>('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Gemini 2.5 Flash Image Preview Pricing
  const PRICING = {
    INPUT_TOKEN_COST: 0.30 / 1_000_000,
    OUTPUT_TOKEN_COST: 2.50 / 1_000_000,
    INPUT_IMAGE_COST: 1.238 / 1000,
    OUTPUT_IMAGE_COST: 0.03 / 1000
  }

  const calculateCost = (usage: any): UsageMetrics => {
    const promptTokens = usage.prompt_tokens || 0
    const completionTokens = usage.completion_tokens || 0
    const imageTokens = usage.completion_tokens_details?.image_tokens || 0
    const inputImages = transformMode !== 'generate' && uploadedImage ? 1 : 0
    const outputImages = imageTokens > 0 ? imageCount : 0

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

  const totalMetrics = generatedMedia.reduce(
    (acc, item) => {
      if (item.usage) {
        return {
          totalTokens: acc.totalTokens + item.usage.totalTokens,
          totalCost: acc.totalCost + item.usage.cost,
          totalImages: acc.totalImages + (item.usage.outputImages || 0)
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

  const buildEnhancedPrompt = (): string => {
    let enhancedPrompt = prompt

    // Add transformation mode specific prompts
    if (transformMode === 'enhance') {
      enhancedPrompt = `Enhance this image with upscaling, denoising, and sharpening. ${prompt}`
    } else if (transformMode === 'restyle' && restylePrompt) {
      enhancedPrompt = `${restylePrompt}. ${prompt}`
    }

    // Add style, theme, and lighting modifiers
    enhancedPrompt += stylePrompt + themePrompt + lightingPrompt

    return enhancedPrompt
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    
    try {
      if (!ENV.OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not found. Please add VITE_OPENROUTER_KEY to your .env file')
      }

      const modelName = 'google/gemini-2.5-flash-image-preview'
      const enhancedPrompt = buildEnhancedPrompt()

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
            content: uploadedImage && transformMode !== 'generate' ? [
              { type: 'text', text: enhancedPrompt },
              { type: 'image_url', image_url: { url: uploadedImage } }
            ] : enhancedPrompt
          }],
          n: imageCount // Request multiple images
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to generate image')
      }

      const data = await response.json()
      console.log('API Response:', data)
      
      const imageUrl = data.choices[0]?.message?.images?.[0]?.image_url?.url || 
                       data.choices[0]?.message?.content || ''
      
      if (!imageUrl) {
        throw new Error('No image URL in response')
      }

      const usage = calculateCost(data.usage)

      const newMedia: GeneratedMedia = {
        id: Date.now().toString(),
        type: 'image',
        prompt,
        url: imageUrl,
        model: modelName,
        timestamp: new Date(),
        usage,
        style: selectedStyle || undefined,
        theme: selectedTheme || undefined,
        lighting: selectedLighting || undefined,
        mode: transformMode
      }
      setGeneratedMedia(prev => [newMedia, ...prev])
      // Don't clear prompt immediately to allow regeneration
    } catch (error: any) {
      console.error('Generation error:', error)
      alert(error.message || 'Failed to generate media')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = (url: string, filename?: string) => {
    if (url.startsWith('data:')) {
      const link = document.createElement('a')
      link.href = url
      link.download = filename || `generated-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
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
          alert('Failed to download')
        })
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-border bg-card/50 backdrop-blur-sm p-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">AI Media Studio</h1>
              <Badge variant="secondary" className="text-xs">Enhanced</Badge>
            </div>
            <div className="flex items-center gap-3">
              {generatedMedia.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{totalMetrics.totalImages} generated</Badge>
                  <Badge variant="outline">{totalMetrics.totalTokens.toLocaleString()} tokens</Badge>
                  <Badge variant="default" className="font-mono">
                    ${totalMetrics.totalCost.toFixed(4)}
                  </Badge>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? 'Hide' : 'Show'} History
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate stunning images and videos with AI • Powered by Gemini 2.5 Flash
          </p>
        </div>
      </motion.div>

      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Control Panel */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-80 flex-shrink-0 border-r border-border bg-card/30"
          >
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {/* Media Type Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'image' | 'video')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="image">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Image
                    </TabsTrigger>
                    <TabsTrigger value="video">
                      <Video className="h-4 w-4 mr-2" />
                      Video
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {activeTab === 'image' ? (
                  <>
                    {/* Transformation Mode */}
                    <TransformationMode
                      mode={transformMode}
                      onModeChange={setTransformMode}
                      restyleOption={restyleOption}
                      onRestyleChange={(id, prompt) => {
                        setRestyleOption(id)
                        setRestylePrompt(prompt)
                      }}
                    />

                    {/* Upload Image (for Enhance/Restyle modes) */}
                    {transformMode !== 'generate' && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Upload Image</Label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        {uploadedImage ? (
                          <div className="relative">
                            <img
                              src={uploadedImage}
                              alt="Upload"
                              className="w-full rounded-lg border"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                              onClick={() => setUploadedImage(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Image
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Prompt Input */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        {transformMode === 'generate' ? 'Describe your image' : 'Additional instructions'}
                      </Label>
                      <Textarea
                        placeholder={transformMode === 'generate' 
                          ? 'A serene mountain landscape with crystal clear lake...' 
                          : 'Add any specific requirements...'}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                    </div>

                    {/* Image Count Selector */}
                    {transformMode === 'generate' && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Number of Images</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {([1, 2, 3, 4] as const).map(count => (
                            <Button
                              key={count}
                              variant={imageCount === count ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setImageCount(count)}
                            >
                              {count}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Style Picker */}
                    {transformMode === 'generate' && (
                      <StylePicker
                        value={selectedStyle}
                        onChange={(id, prompt) => {
                          setSelectedStyle(id)
                          setStylePrompt(prompt)
                        }}
                      />
                    )}

                    {/* Theme Picker */}
                    {transformMode === 'generate' && (
                      <ThemePicker
                        value={selectedTheme}
                        onChange={(id, prompt) => {
                          setSelectedTheme(id)
                          setThemePrompt(prompt)
                        }}
                      />
                    )}

                    {/* Lighting Picker */}
                    {transformMode === 'generate' && (
                      <LightingPicker
                        value={selectedLighting}
                        onChange={(id, prompt) => {
                          setSelectedLighting(id)
                          setLightingPrompt(prompt)
                        }}
                      />
                    )}

                    {/* Generate Button */}
                    <Button
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || isGenerating || (transformMode !== 'generate' && !uploadedImage)}
                      className="w-full"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate {imageCount > 1 ? `${imageCount} Images` : 'Image'}
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Video Generation</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Coming soon! Video generation will support motion, transitions, and effects.
                    </p>
                    <Badge variant="outline">UI Preview Only</Badge>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </motion.div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Generated Media Display */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-6">
                {generatedMedia.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center"
                  >
                    <Sparkles className="h-20 w-20 text-primary/20 mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Start Creating</h2>
                    <p className="text-muted-foreground max-w-md">
                      Describe what you want to create, choose your style, and let AI bring your vision to life.
                    </p>
                  </motion.div>
                ) : (
                  <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                    <AnimatePresence>
                      {generatedMedia.map((media) => (
                        <motion.div
                          key={media.id}
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="break-inside-avoid"
                        >
                          <Card className="overflow-hidden group hover:shadow-xl transition-shadow">
                            <div className="relative overflow-hidden">
                              <img
                                src={media.url}
                                alt={media.prompt}
                                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {isGenerating && (
                                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                                  <div className="flex items-center gap-2">
                                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                                    <span className="text-sm font-medium">Generating...</span>
                                  </div>
                                </div>
                              )}
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="h-8 w-8 backdrop-blur-sm"
                                  onClick={() => handleDownload(media.url)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="h-8 w-8 backdrop-blur-sm"
                                >
                                  <Heart className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="h-8 w-8 backdrop-blur-sm"
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="p-3">
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {media.prompt}
                              </p>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {media.mode && (
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {media.mode}
                                  </Badge>
                                )}
                                {media.style && (
                                  <Badge variant="secondary" className="text-xs">
                                    {media.style}
                                  </Badge>
                                )}
                              </div>
                              {media.usage && (
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>{media.usage.totalTokens.toLocaleString()} tokens</span>
                                  <span className="font-mono">${media.usage.cost.toFixed(4)}</span>
                                </div>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* History Panel */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  className="w-80 border-l border-border bg-card/30"
                >
                  <MediaHistory
                    media={generatedMedia}
                    onSelect={(media) => {
                      setPrompt(media.prompt)
                      setTransformMode(media.mode || 'generate')
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
