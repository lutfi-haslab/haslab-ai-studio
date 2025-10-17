import { useState, useRef, useEffect } from 'react'
import { useStore } from '@tanstack/react-store'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import {
  Send,
  Paperclip,
  Mic,
  Square,
  User,
  Bot,
  Copy,
  StopCircle,
  Plus
} from 'lucide-react'
import { modelSettingsStore } from '@/lib/model-settings-store'
import { conversationStore } from '@/lib/conversation-store'
import { getAIProvider } from '@/lib/ai-service'
import { AI_MODELS, BASEURL } from '@/lib/ai-models'
import type { StoredMessage } from '@/lib/storage'
import { MarkdownMessage } from './MarkdownMessage'
import { Badge } from '@/components/ui/badge'
import ENV from '@/lib/env'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)

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

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
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
    setMessages(prev => [...prev, userMessage])
    setInput('')
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

        const allMessages = [
          ...(settings.systemInstructions ? [{ role: 'system' as const, content: settings.systemInstructions }] : []),
          ...conversationHistory,
          { role: 'user' as const, content: userInput }
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
        // Use LangChain for OpenRouter and DeepSeek
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
    setMessages([])
    setCurrentConversationId(null)
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
                    {message.role === 'assistant' && (
                      <>
                        <Badge variant="secondary" className="text-xs">
                          {modelInfo?.name || 'Unknown'}
                        </Badge>
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.isStreaming && <span className="text-blue-500 animate-pulse">• Streaming</span>}
                      </>
                    )}
                    {message.role === 'user' && (
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                    )}
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
          <div className="relative">
            <div className="flex items-end gap-3 bg-background rounded-2xl border border-border p-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Paperclip className="h-4 w-4" />
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