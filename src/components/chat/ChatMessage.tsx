import { motion } from 'framer-motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bot, User, Copy, Check } from 'lucide-react'
import { MarkdownMessage } from './MarkdownMessage'
import { useState } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
  image?: string
}

interface ChatMessageProps {
  message: Message
  modelName?: string
}

export function ChatMessage({ message, modelName }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  }

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={`flex gap-3 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        <Avatar className={`h-8 w-8 flex-shrink-0 ${isUser ? 'order-2' : 'order-1'}`}>
          <AvatarFallback className={isUser ? 'bg-primary/10 text-primary' : 'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground'}>
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      </motion.div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[75%] md:max-w-[60%] ${isUser ? 'items-end' : 'items-start'}`}>
        <Card
          className={`relative group/message ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border-border hover:shadow-md transition-shadow'
          }`}
        >
          <div className="p-3">
            {/* Image if present */}
            {message.image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-3"
              >
                <img
                  src={message.image}
                  alt="Uploaded"
                  className="max-w-full rounded-lg border border-border/50"
                />
              </motion.div>
            )}

            {/* Message Text */}
            <div className="text-sm">
              <MarkdownMessage content={message.content} isUser={isUser} />
            </div>

            {/* Streaming indicator */}
            {message.isStreaming && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50"
              >
                <div className="flex space-x-1">
                  <motion.div
                    className="w-1.5 h-1.5 bg-primary rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 bg-primary rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 bg-primary rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
                <span className="text-xs text-muted-foreground ml-2">Generating...</span>
              </motion.div>
            )}

            {/* Copy button for assistant messages */}
            {!isUser && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover/message:opacity-100 transition-opacity"
                onClick={handleCopy}
                title="Copy message"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Metadata */}
        <div className={`flex items-center gap-2 mt-1 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!isUser && modelName && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <Badge variant="secondary" className="text-xs h-5 px-1.5">
                {modelName}
              </Badge>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
