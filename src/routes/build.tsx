import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Send,
  Code,
  Copy,
  Download,
  Play,
  User,
  Bot,
  FileText,
  Terminal,
  Folder,
  RefreshCw
} from 'lucide-react'

export const Route = createFileRoute('/build')({
  component: Build,
})

interface CodeMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  code?: string
  language?: string
  timestamp: Date
}

function Build() {
  const [messages, setMessages] = useState<CodeMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI coding assistant. I can help you build applications, write code, debug issues, and explain programming concepts. What would you like to build today?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: CodeMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response with code
    setTimeout(() => {
      const assistantMessage: CodeMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'll help you with that. Here's a solution in ${selectedLanguage}:`,
        code: `// Example ${selectedLanguage} code
function greetUser(name) {
  console.log(\`Hello, \${name}! Welcome to the app.\`);
  return \`Welcome \${name}!\`;
}

// Usage
const userName = "Developer";
const greeting = greetUser(userName);`,
        language: selectedLanguage,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
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
      {/* Header */}
      <div className="border-b border-border bg-card/50 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">Build</h1>
              <p className="text-sm text-muted-foreground">AI-powered code generation and development assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="csharp">C#</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
                <SelectItem value="php">PHP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <div className="max-w-6xl mx-auto py-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-4xl ${
                  message.role === 'user' ? 'order-1' : 'order-2'
                }`}>
                  <Card className={`p-4 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-8' 
                      : 'bg-card'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3">
                      {message.content}
                    </p>
                    
                    {message.code && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {message.language}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <Play className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4 border">
                          <pre className="text-sm text-foreground overflow-x-auto">
                            <code>{message.code}</code>
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    {message.role === 'assistant' && !message.code && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </Card>
                  
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {message.role === 'assistant' && 'AI Assistant'}
                    <span>{message.timestamp.toLocaleTimeString()}</span>
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
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">Generating code...</span>
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
        <div className="max-w-6xl mx-auto p-4">
          <div className="relative">
            <div className="flex items-end gap-3 bg-background rounded-2xl border border-border p-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <FileText className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Folder className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Terminal className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Describe what you want to build or ask a coding question..."
                  className="w-full resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none min-h-[20px] max-h-[120px]"
                  rows={1}
                />
              </div>
              
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-8 w-8"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-2">
            AI can make mistakes. Always review generated code before using in production.
          </p>
        </div>
      </div>
    </div>
  )
}