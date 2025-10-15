import { createFileRoute } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  Image as ImageIcon,
  Mic,
  Code,
  Zap,
  Brain,
  ArrowRight
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

interface FeatureCard {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  badge?: string
  gradient?: string
}

const FEATURE_CARDS: FeatureCard[] = [
  {
    id: 'generate-content',
    title: 'Generate AI Content',
    description: 'Create high-quality text, code, and creative content with advanced AI models',
    icon: <Sparkles className="h-6 w-6" />,
    badge: 'Popular',
    gradient: 'from-pink-500 to-purple-600'
  },
  {
    id: 'process-media',
    title: 'Process Media',
    description: 'Analyze images, videos, and documents with powerful vision capabilities',
    icon: <ImageIcon className="h-6 w-6" />,
    badge: 'New',
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'voice-interaction',
    title: 'Voice Interaction',
    description: 'Engage in natural conversations with speech-to-text and text-to-speech',
    icon: <Mic className="h-6 w-6" />,
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    id: 'code-generation',
    title: 'Code Generation',
    description: 'Write, debug, and optimize code across multiple programming languages',
    icon: <Code className="h-6 w-6" />,
    badge: 'Pro',
    gradient: 'from-orange-500 to-red-600'
  }
]

function FeatureCard({ card }: { card: FeatureCard }) {
  const handleCardClick = () => {
    // Handle navigation to feature page
    console.log(`Navigate to ${card.id}`)
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleCardClick()
  }

  return (
    <Card
      className="group relative overflow-hidden border-border/50 bg-card hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
      aria-label={`Navigate to ${card.title}: ${card.description}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <div className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-3 rounded-lg bg-gradient-to-br ${card.gradient} text-white`}
            aria-hidden="true"
          >
            {card.icon}
          </div>
          {card.badge && (
            <Badge variant="secondary" className="text-xs" aria-label={`Feature status: ${card.badge}`}>
              {card.badge}
            </Badge>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {card.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {card.description}
        </p>
        
        <Button
          variant="ghost"
          className="p-0 h-auto text-primary hover:text-primary/80 group"
          onClick={handleButtonClick}
          aria-label={`Get started with ${card.title}`}
        >
          Get started
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Button>
      </div>
    </Card>
  )
}

function Dashboard() {
  return (
    <div className="flex-1 h-full flex flex-col">
      {/* Main Content - Google AI Studio style */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="text-6xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Google AI Studio
              </div>
            </div>
          </div>
          
          {/* Feature Cards - Google AI Studio style */}
          <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
            {FEATURE_CARDS.slice(0, 4).map((card) => (
              <div
                key={card.id}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/10"
                onClick={() => console.log(`Navigate to ${card.id}`)}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-lg`}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                  {card.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {card.badge}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer note */}
          <div className="text-center pt-12">
            <p className="text-sm text-muted-foreground">
              Google AI models may make mistakes, so double-check outputs. Your conversations with Gemini
            </p>
            <p className="text-sm text-muted-foreground">
              may be reviewed and used to improve our products.
              <a href="#" className="text-primary hover:underline ml-1">Learn more</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
