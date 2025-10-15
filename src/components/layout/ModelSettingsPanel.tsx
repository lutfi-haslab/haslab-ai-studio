import { useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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
  Info
} from 'lucide-react'
import { AI_MODELS } from '@/lib/ai-models'
import { modelSettingsStore } from '@/lib/model-settings-store'

interface LocalSettings {
  expandedBasic: boolean
  expandedAdvanced: boolean
}

export function ModelSettingsPanel() {
  const settings = useStore(modelSettingsStore)
  const [localSettings, setLocalSettings] = useState<LocalSettings>({
    expandedBasic: true,
    expandedAdvanced: false
  })

  const selectedModel = AI_MODELS.find(m => m.model === settings.model)
  const availableModels = AI_MODELS.filter(m => m.model && m.name)

  const toggleSection = (section: keyof LocalSettings) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    modelSettingsStore.setState(prev => ({ ...prev, [key]: value }))
  }

  const updateModel = (modelId: string) => {
    const model = AI_MODELS.find(m => m.model === modelId)
    if (model) {
      modelSettingsStore.setState(prev => ({
        ...prev,
        model: model.model,
        provider: model.provider
      }))
    }
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
          <Select value={settings.model} onValueChange={updateModel}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select a model">
                {selectedModel?.name || 'Select a model'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.model} value={model.model} className="text-sm p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {model.provider === 'openrouter' && <Brain className="h-3 w-3 text-green-500" />}
                      {model.provider === 'deepseek' && <Zap className="h-3 w-3 text-blue-500" />}
                      {model.provider === 'iflow' && <Code className="h-3 w-3 text-purple-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 capitalize">{model.provider}</div>
                    </div>
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
            <Collapsible open={localSettings.expandedBasic} onOpenChange={() => toggleSection('expandedBasic')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto text-sm font-medium">
                  Basic settings
                  {localSettings.expandedBasic ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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

                {/* Max Tokens */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-medium text-muted-foreground">Max tokens</Label>
                    <span className="text-xs text-muted-foreground">{settings.maxTokens}</span>
                  </div>
                  <Slider
                    value={[settings.maxTokens]}
                    onValueChange={(value) => updateSetting('maxTokens', value[0])}
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
              </CollapsibleContent>
            </Collapsible>

            <Separator className="bg-border" />

            {/* Model Info */}
            {selectedModel && (
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
                      <span>Name:</span>
                      <span className="text-foreground">{selectedModel.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Provider:</span>
                      <span className="text-foreground capitalize">{selectedModel.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Model ID:</span>
                      <span className="text-foreground text-[10px] truncate max-w-[150px]" title={selectedModel.model}>
                        {selectedModel.model}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}