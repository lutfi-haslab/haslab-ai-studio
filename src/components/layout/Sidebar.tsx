import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  MessageSquare,
  Plus,
  Menu,
  Sparkles,
  Brain,
  Zap,
  Settings,
  History,
  Star,
  Home,
  Play,
  Image as ImageIcon,
  Code,
  BarChart3,
  FileText,
  ExternalLink,
  Key,
  Activity,
  User,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface Model {
  id: string
  name: string
  provider: string
  type: 'text' | 'vision' | 'code'
  status: 'online' | 'offline' | 'beta'
}

interface ChatSession {
  id: string
  title: string
  model: string
  lastMessage: string
  timestamp: Date
  isStarred?: boolean
}

const AVAILABLE_MODELS: Model[] = [
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', type: 'text', status: 'online' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', type: 'text', status: 'online' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', type: 'text', status: 'online' },
  { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', provider: 'Google', type: 'vision', status: 'beta' },
]

const RECENT_CHATS: ChatSession[] = [
  { id: '1', title: 'React Component Architecture', model: 'Gemini Pro', lastMessage: 'Let me help you design...', timestamp: new Date(), isStarred: true },
  { id: '2', title: 'Database Optimization Strategies', model: 'GPT-4', lastMessage: 'For PostgreSQL performance...', timestamp: new Date(Date.now() - 3600000) },
  { id: '3', title: 'Machine Learning Model Deployment', model: 'Claude 3', lastMessage: 'Container orchestration with...', timestamp: new Date(Date.now() - 7200000) },
]

export function Sidebar() {
  const [selectedModel, setSelectedModel] = useState('gemini-pro')
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [studioExpanded, setStudioExpanded] = useState(true)
  const [dashboardExpanded, setDashboardExpanded] = useState(false)
  const [historyExpanded, setHistoryExpanded] = useState(true)

  const studioItems = [
    { icon: MessageSquare, label: 'Chat', href: '/chat' },
    { icon: Play, label: 'Stream', href: '/stream' },
    { icon: ImageIcon, label: 'Generate media', href: '/media' },
    { icon: Code, label: 'Build', href: '/build' }
  ]

  const dashboardItems = [
    { icon: BarChart3, label: 'Project', href: '/project' },
    { icon: Activity, label: 'Usage', href: '/usage' }
  ]

  const footerItems = [
    { icon: Key, label: 'Get API key', href: '/api-keys' },
    { icon: Activity, label: 'View status', href: '/status' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-card">
      {/* New Chat Button */}
      <div className="p-4">
        <Button className="w-full justify-start gap-2 h-10 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>

      <Separator className="bg-border" />

      {/* Navigation */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-2">
            {/* Studio Accordion */}
            <Collapsible open={studioExpanded} onOpenChange={setStudioExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 h-9 px-3 text-foreground hover:bg-accent">
                  {studioExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <Home className="h-4 w-4" />
                  <span className="text-sm font-semibold">Studio</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1 ml-6">
                {studioItems.map((item, index) => {
                  const Icon = item.icon
                  const isActive = item.href === '/chat' // Chat is active for demo
                  
                  return (
                    <Link key={item.label} to={item.href} className="block">
                      <Button
                        variant="ghost"
                        className={`w-full justify-start gap-3 h-9 px-3 text-sm ${
                          isActive
                            ? 'bg-primary/10 text-primary hover:bg-primary/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
                
                {/* History as sub-accordion under Studio */}
                <Collapsible open={historyExpanded} onOpenChange={setHistoryExpanded}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-2 h-9 px-3 text-muted-foreground hover:text-foreground">
                      {historyExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <History className="h-4 w-4" />
                      <span className="text-sm font-medium">History</span>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-1 ml-6">
                    {RECENT_CHATS.map((chat) => (
                      <Button
                        key={chat.id}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-2 hover:bg-accent group"
                        aria-label={`Open conversation: ${chat.title}`}
                      >
                        <div className="flex items-start gap-2 w-full">
                          <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-sm font-medium text-foreground truncate">{chat.title}</span>
                              {chat.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" aria-label="Starred conversation" />}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {chat.timestamp.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </CollapsibleContent>
            </Collapsible>
            
            <Separator className="bg-border my-2" />
            
            {/* Dashboard Accordion */}
            <Collapsible open={dashboardExpanded} onOpenChange={setDashboardExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 h-9 px-3 text-foreground hover:bg-accent">
                  {dashboardExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm font-semibold">Dashboard</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1 ml-6">
                {dashboardItems.map((item) => {
                  const Icon = item.icon
                  
                  return (
                    <Link key={item.label} to={item.href} className="block">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-9 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
      </div>

      <Separator className="bg-border" />

      {/* Footer */}
      <div className="p-4 space-y-1">
        {footerItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start gap-2 h-9 px-3 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{item.label}</span>
            </Button>
          )
        })}
        
        {/* Profile Section */}
        <div className="pt-2 mt-2 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-9 px-3 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-muted text-muted-foreground">
                <User className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-foreground">user@example.com</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-border lg:bg-card">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-50 text-muted-foreground">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-card border-border">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
