import { useState, useRef, useEffect } from 'react'
import { useStore } from '@tanstack/react-store'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Send,
  Paperclip,
  Mic,
  Square,
  User,
  Bot,
  Copy,
  StopCircle,
  Plus,
  X,
  Image as ImageIcon
} from 'lucide-react'
import { modelSettingsStore } from '@/lib/model-settings-store'
import { conversationStore } from '@/lib/conversation-store'
import { getAIProvider } from '@/lib/ai-service'
import { AI_MODELS, BASEURL } from '@/lib/ai-models'
import type { StoredMessage } from '@/lib/storage'
import { MarkdownMessage } from './MarkdownMessage'
import ENV from '@/lib/env'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
  image?: string // Base64 encoded image
}

interface ChatInterfaceProps {
  mode: 'chat' | 'stream'
}

export function ChatInterface({ mode }: ChatInterfaceProps) {
  const settings = useStore(modelSettingsStore)
  const modelInfo = AI_MODELS.find(m => m.model === settings.model)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)

  // Models that support vision/image input
  const visionModels = [
    'google/gemini-2.0-flash-exp:free',
    'google/gemini-pro-vision',
    'openai/gpt-4-vision-preview',
    'anthropic/claude-3-opus',
    'anthropic/claude-3-sonnet',
    'anthropic/claude-3-haiku'
  ]
  const supportsVision = visionModels.some(model => settings.model.includes(model.split('/')[1]) || settings.model === model)

  useEffect(() => {
    const activeConversation = conversationStore.getActiveConversation()
    if (activeConversation) {
      setMessages(activeConversation.messages)
      setCurrentConversationId(activeConversation.id)
    } else {
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: `Hello! I'm ${modelInfo?.name || 'your AI assistant'}. How can I help you today?`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [modelInfo])

  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      const storedMessages: StoredMessage[] = messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp
      }))
      conversationStore.updateConversationMessages(currentConversationId, storedMessages)
    }
  }, [messages, currentConversationId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0]
    if (!file) return

    // Check if model supports vision
    if (!supportsVision) {
      alert(`⚠️ Image upload not supported\n\nThe current model "${modelInfo?.name || settings.model}" does not support image input.\n\nPlease switch to a vision-capable model like:\n- Google Gemini 2.0 Flash\n- GPT-4 Vision\n- Claude 3 (Opus/Sonnet/Haiku)`)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file is too large. Maximum size is 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setUploadedImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    // Check if trying to send image with non-vision model
    if (uploadedImage && !supportsVision) {
      alert(`⚠️ Image upload not supported\n\nThe current model "${modelInfo?.name || settings.model}" does not support image input.\n\nPlease remove the image or switch to a vision-capable model.`)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      image: uploadedImage || undefined
    }

    if (!currentConversationId) {
      const conversation = conversationStore.createNewConversation(
        settings.provider,
        modelInfo?.name || settings.model,
        userMessage
      )
      setCurrentConversationId(conversation.id)
    }

    const userInput = input
    const userImageData = uploadedImage
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setIsLoading(true)

    const controller = new AbortController()
    setAbortController(controller)

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }))

      // Handle iFlow separately with fetch to avoid CORS issues
      if (settings.provider === 'iflow') {
        if (!ENV.IFLOW_API_KEY) {
          throw new Error('iFlow API key is not set. Please add VITE_IFLOW_KEY to your .env file')
        }

        console.log('[iFlow] Using fetch API - endpoint:', `${BASEURL.iflow}/v1/chat/completions`, 'model:', settings.model)

        // Build user message content
        let userContent: any = userInput
        if (userImageData && supportsVision) {
          userContent = [
            { type: 'text', text: userInput },
            { type: 'image_url', image_url: { url: userImageData } }
          ]
        }

        const allMessages = [
          ...(settings.systemInstructions ? [{ role: 'system' as const, content: settings.systemInstructions }] : []),
          ...conversationHistory,
          { role: 'user' as const, content: userContent }
        ]

        const requestBody = {
          model: settings.model,
          messages: allMessages,
          temperature: settings.temperature,
          top_p: settings.topP,
          stream: mode === 'stream'
        }

        const response = await fetch(`${BASEURL.iflow}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ENV.IFLOW_API_KEY}`
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        })

        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          throw new Error(error.msg || error.message || `HTTP ${response.status}`)
        }

        if (mode === 'stream') {
          const assistantMessageId = (Date.now() + 1).toString()
          const assistantMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isStreaming: true
          }
          setMessages(prev => [...prev, assistantMessage])

          const reader = response.body?.getReader()
          const decoder = new TextDecoder()
          let fullText = ''

          if (reader) {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'))

              for (const line of lines) {
                const data = line.replace(/^data: /, '').trim()
                if (data === '[DONE]') continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices[0]?.delta?.content || ''
                  fullText += content
                  setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: fullText }
                      : msg
                  ))
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }

          setMessages(prev => prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, isStreaming: false }
              : msg
          ))
        } else {
          const data = await response.json()
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.choices[0]?.message?.content || '',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, assistantMessage])
        }
      } else {
        // Use direct API for vision models, LangChain for text-only
        if (userImageData && supportsVision && settings.provider === 'openrouter') {
          // Direct API call for vision models
          if (!ENV.OPENROUTER_API_KEY) {
            throw new Error('OpenRouter API key is not set')
          }

          const userContent = [
            { type: 'text', text: userInput },
            { type: 'image_url', image_url: { url: userImageData } }
          ]

          const allMessages = [
            ...(settings.systemInstructions ? [{ role: 'system', content: settings.systemInstructions }] : []),
            ...conversationHistory,
            { role: 'user', content: userContent }
          ]

          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${ENV.OPENROUTER_API_KEY}`,
              'HTTP-Referer': window.location.origin,
            },
            body: JSON.stringify({
              model: settings.model,
              messages: allMessages,
              temperature: settings.temperature,
              top_p: settings.topP,
              stream: mode === 'stream'
            }),
            signal: controller.signal
          })

          if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.error?.message || `HTTP ${response.status}`)
          }

          if (mode === 'stream') {
            const assistantMessageId = (Date.now() + 1).toString()
            const assistantMessage: Message = {
              id: assistantMessageId,
              role: 'assistant',
              content: '',
              timestamp: new Date(),
              isStreaming: true
            }
            setMessages(prev => [...prev, assistantMessage])

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            let fullText = ''

            if (reader) {
              while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'))

                for (const line of lines) {
                  const data = line.replace(/^data: /, '').trim()
                  if (data === '[DONE]') continue

                  try {
                    const parsed = JSON.parse(data)
                    const content = parsed.choices[0]?.delta?.content || ''
                    fullText += content
                    setMessages(prev => prev.map(msg =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: fullText }
                        : msg
                    ))
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }

            setMessages(prev => prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, isStreaming: false }
                : msg
            ))
          } else {
            const data = await response.json()
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: data.choices[0]?.message?.content || '',
              timestamp: new Date()
            }
            setMessages(prev => [...prev, assistantMessage])
          }
        } else {
          // Use LangChain for OpenRouter and DeepSeek (text-only)
          const llm = getAIProvider(settings)

          const langchainMessages = [
            ...(settings.systemInstructions ? [new SystemMessage(settings.systemInstructions)] : []),
            ...conversationHistory.map(msg =>
              msg.role === 'user' ? new HumanMessage(msg.content) : new SystemMessage(msg.content)
            ),
            new HumanMessage(userInput)
          ]

        if (mode === 'stream') {
          const assistantMessageId = (Date.now() + 1).toString()
          const assistantMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isStreaming: true
          }
          setMessages(prev => [...prev, assistantMessage])

          const stream = await llm.stream(langchainMessages, {
            signal: controller.signal
          })

          let fullText = ''
          for await (const chunk of stream) {
            fullText += chunk.content
            setMessages(prev => prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: fullText }
                : msg
            ))
          }

          setMessages(prev => prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, isStreaming: false }
              : msg
          ))
        } else {
          const response = await llm.invoke(langchainMessages, {
            signal: controller.signal
          })

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.content.toString(),
            timestamp: new Date()
          }
          setMessages(prev => [...prev, assistantMessage])
        }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted')
      } else {
        console.error('Error generating response:', error)

        let errorMsg = error.message || 'Failed to generate response. Please check your API keys and try again.'

        // Handle specific provider errors
        if (error.message?.includes('API key')) {
          errorMsg = `${error.message}\n\nPlease check your .env file and ensure you have:\n- VITE_OPENROUTER_KEY for OpenRouter models\n- VITE_DEEPSEEK_KEY for DeepSeek models\n- VITE_IFLOW_KEY for iFlow models`
        } else if (error.status === 434 || error.message?.includes('434')) {
          errorMsg = 'Invalid iFlow API key. Please check your VITE_IFLOW_KEY in the .env file.'
        } else if (error.status === 404) {
          errorMsg = `API endpoint not found (404). This might be a configuration issue.\n\nProvider: ${settings.provider}\nModel: ${settings.model}\n\nError: ${error.message}`
        }

        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `❌ Error: ${errorMsg}`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } finally {
      setIsLoading(false)
      setAbortController(null)
    }
  }

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleVoiceInput = () => {
    setIsListening(!isListening)
    // Voice input logic would go here
  }

  const handleNewChat = () => {
    // Clear all previous state
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `Hello! I'm ${modelInfo?.name || 'your AI assistant'}. How can I help you today?`,
      timestamp: new Date()
    }])
    setCurrentConversationId(null)
    setInput('')
    setIsLoading(false)
    setIsListening(false)
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    // Cancel any ongoing requests
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
    conversationStore.setActiveConversation(null)
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  return (
    <div className="flex flex-col h-full bg-background">
      {/* New Chat Button */}
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {currentConversationId ? 'Conversation' : 'New Chat'}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNewChat}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <div className="max-w-4xl mx-auto py-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-2xl ${message.role === 'user' ? 'order-1' : 'order-2'
                  }`}>
                  <Card className={`p-4 relative ${message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-8'
                    : 'bg-card'
                    }`}>
                    {message.image && (
                      <div className="mb-3">
                        <img 
                          src={message.image} 
                          alt="Uploaded" 
                          className="max-w-xs rounded-lg border border-border"
                        />
                      </div>
                    )}
                    <div className="text-sm pr-8">
                      <MarkdownMessage content={message.content} isUser={message.role === 'user'} />
                    </div>

                    {message.role === 'assistant' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-2 right-2 h-6 w-6 p-0 hover:bg-muted"
                        onClick={() => {
                          navigator.clipboard.writeText(message.content)
                          // Show notification - you might want to add a toast notification here
                          console.log('Message copied to clipboard!')
                        }}
                        title="Copy message"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </Card>

                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {message.role === 'assistant' && modelInfo?.name}
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.isStreaming && <span className="text-blue-500">• Streaming</span>}
                  </div>
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-muted">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 justify-start">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="p-4 bg-card max-w-2xl">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </Card>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50">
        <div className="max-w-4xl mx-auto p-4">
          {/* Image Preview */}
          {uploadedImage && (
            <div className="mb-3 relative inline-block">
              <img 
                src={uploadedImage} 
                alt="Upload preview" 
                className="max-w-xs rounded-lg border border-border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={removeImage}
              >
                <X className="h-3 w-3" />
              </Button>
              {!supportsVision && (
                <Badge variant="destructive" className="absolute bottom-2 left-2">
                  Model doesn't support images
                </Badge>
              )}
            </div>
          )}
          
          <div className="relative">
            <div className="flex items-end gap-3 bg-background rounded-2xl border border-border p-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => fileInputRef.current?.click()}
                title={supportsVision ? "Upload image" : "Current model doesn't support images"}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>

              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={mode === 'stream' ? 'Stream your message...' : `Message ${modelInfo?.name || 'AI'}...`}
                  className="w-full resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none min-h-[20px] max-h-[120px]"
                  rows={1}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${isListening ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={toggleVoiceInput}
                >
                  {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>

                {isLoading ? (
                  <Button
                    onClick={handleStopGeneration}
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                  >
                    <StopCircle className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim()}
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-2">
            AI may display inaccurate info. Current model: {modelInfo?.name || 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  )
}