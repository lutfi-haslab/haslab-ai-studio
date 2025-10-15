import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ChevronDown,
  ChevronUp,
  Brain,
  Zap,
  Code,
  Settings,
  Info,
  Sparkles
} from 'lucide-react'

interface ModelSettings {
  model: string
  systemInstructions: string
  temperature: number
  maxOutputTokens: number
  topP: number
  topK: number
  mediaResolution: string
  thinkingMode: boolean
  thinkingBudget: number
  structuredOutput: boolean
  codeExecution: boolean
  functionCalling: boolean
  grounding: boolean
}

const AVAILABLE_MODELS = [
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Most capable model for complex tasks',
    provider: 'Google',
    type: 'text',
    status: 'online' as const
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Fast and efficient for most tasks',
    provider: 'Google',
    type: 'text',
    status: 'online' as const
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Balanced performance and cost',
    provider: 'Google',
    type: 'text',
    status: 'online' as const
  },
  {
    id: 'gemini-pro-vision',
    name: 'Gemini Pro Vision',
    description: 'Multimodal capabilities with image understanding',
    provider: 'Google',
    type: 'vision',
    status: 'beta' as const
  }
]

export function ModelSettingsPanel() {
  const [settings, setSettings] = useState<ModelSettings>({
    model: 'gemini-2.5-pro',
    systemInstructions: '',
    temperature: 1,
    maxOutputTokens: 8192,
    topP: 0.95,
    topK: 64,
    mediaResolution: 'default',
    thinkingMode: false,
    thinkingBudget: 1024,
    structuredOutput: false,
    codeExecution: false,
    functionCalling: false,
    grounding: false
  })

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    advanced: false,
    capabilities: false
  })

  const selectedModel = AVAILABLE_MODELS.find(m => m.id === settings.model) || AVAILABLE_MODELS[0]

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const updateSetting = <K extends keyof ModelSettings>(key: K, value: ModelSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="w-80 border-l border-border bg-card h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Run settings</h3>
        </div>
        
        {/* Model Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Model</Label>
          <Select value={settings.model} onValueChange={(value) => updateSetting('model', value)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select a model">
                {selectedModel.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id} className="text-sm p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {model.type === 'vision' && <Zap className="h-3 w-3 text-blue-500" />}
                      {model.type === 'code' && <Code className="h-3 w-3 text-purple-500" />}
                      {model.type === 'text' && <Brain className="h-3 w-3 text-green-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{model.description}</div>
                    </div>
                    {model.status === 'beta' && (
                      <Badge variant="outline" className="text-xs">Beta</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full scrollbar-dark">
          <div className="p-4 space-y-4">
          {/* System Instructions */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">System instructions</Label>
            <Textarea
              placeholder="Enter system instructions to guide the model's behavior..."
              value={settings.systemInstructions}
              onChange={(e) => updateSetting('systemInstructions', e.target.value)}
              className="min-h-[80px] text-sm resize-none"
            />
          </div>

          <Separator className="bg-border" />

          {/* Basic Settings */}
          <Collapsible open={expandedSections.basic} onOpenChange={() => toggleSection('basic')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto text-sm font-medium">
                Basic settings
                {expandedSections.basic ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-3">
              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium text-muted-foreground">Temperature</Label>
                  <span className="text-xs text-muted-foreground">{settings.temperature}</span>
                </div>
                <Slider
                  value={[settings.temperature]}
                  onValueChange={(value) => updateSetting('temperature', value[0])}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Controls randomness: Lower values make responses more focused and deterministic
                </p>
              </div>

              {/* Max Output Tokens */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium text-muted-foreground">Max output tokens</Label>
                  <span className="text-xs text-muted-foreground">{settings.maxOutputTokens}</span>
                </div>
                <Slider
                  value={[settings.maxOutputTokens]}
                  onValueChange={(value) => updateSetting('maxOutputTokens', value[0])}
                  max={8192}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Top P */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium text-muted-foreground">Top P</Label>
                  <span className="text-xs text-muted-foreground">{settings.topP}</span>
                </div>
                <Slider
                  value={[settings.topP]}
                  onValueChange={(value) => updateSetting('topP', value[0])}
                  max={1}
                  min={0}
                  step={0.05}
                  className="w-full"
                />
              </div>

              {/* Top K */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium text-muted-foreground">Top K</Label>
                  <span className="text-xs text-muted-foreground">{settings.topK}</span>
                </div>
                <Slider
                  value={[settings.topK]}
                  onValueChange={(value) => updateSetting('topK', value[0])}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="bg-border" />

          {/* Media Settings */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Media resolution</Label>
            <Select value={settings.mediaResolution} onValueChange={(value) => updateSetting('mediaResolution', value)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-border" />

          {/* Advanced Settings */}
          <Collapsible open={expandedSections.advanced} onOpenChange={() => toggleSection('advanced')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto text-sm font-medium">
                Advanced settings
                {expandedSections.advanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-3">
              {/* Thinking Mode */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-muted-foreground">Thinking mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable step-by-step reasoning
                  </p>
                </div>
                <Switch
                  checked={settings.thinkingMode}
                  onCheckedChange={(checked) => updateSetting('thinkingMode', checked)}
                />
              </div>

              {settings.thinkingMode && (
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-medium text-muted-foreground">Thinking budget</Label>
                    <span className="text-xs text-muted-foreground">{settings.thinkingBudget}</span>
                  </div>
                  <Slider
                    value={[settings.thinkingBudget]}
                    onValueChange={(value) => updateSetting('thinkingBudget', value[0])}
                    max={4096}
                    min={128}
                    step={128}
                    className="w-full"
                  />
                </div>
              )}

              {/* Structured Output */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-muted-foreground">Structured output</Label>
                  <p className="text-xs text-muted-foreground">
                    Generate responses in JSON format
                  </p>
                </div>
                <Switch
                  checked={settings.structuredOutput}
                  onCheckedChange={(checked) => updateSetting('structuredOutput', checked)}
                />
              </div>

              {/* Code Execution */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-muted-foreground">Code execution</Label>
                  <p className="text-xs text-muted-foreground">
                    Execute code in sandboxed environment
                  </p>
                </div>
                <Switch
                  checked={settings.codeExecution}
                  onCheckedChange={(checked) => updateSetting('codeExecution', checked)}
                />
              </div>

              {/* Function Calling */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-muted-foreground">Function calling</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable function calling capabilities
                  </p>
                </div>
                <Switch
                  checked={settings.functionCalling}
                  onCheckedChange={(checked) => updateSetting('functionCalling', checked)}
                />
              </div>

              {/* Grounding */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium text-muted-foreground">Grounding</Label>
                  <p className="text-xs text-muted-foreground">
                    Use Google Search for factual accuracy
                  </p>
                </div>
                <Switch
                  checked={settings.grounding}
                  onCheckedChange={(checked) => updateSetting('grounding', checked)}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="bg-border" />

          {/* Model Info */}
          <Card className="bg-muted/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium flex items-center gap-2">
                <Info className="h-3 w-3" />
                Model info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Provider:</span>
                  <span className="text-foreground">{selectedModel.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="text-foreground capitalize">{selectedModel.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={selectedModel.status === 'online' ? 'default' : 'secondary'} className="text-xs">
                    {selectedModel.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}