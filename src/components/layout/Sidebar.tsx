import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { conversationStore } from '@/lib/conversation-store'
import {
  MessageSquare,
  Plus,
  Menu,
  History,
  Home,
  Play,
  Image as ImageIcon,
  Code,
  BarChart3,
  Activity,
  User,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const conversationState = useStore(conversationStore)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [studioExpanded, setStudioExpanded] = useState(true)
  const [dashboardExpanded, setDashboardExpanded] = useState(false)
  const [historyExpanded, setHistoryExpanded] = useState(true)

  useEffect(() => {
    conversationStore.loadConversations()
  }, [])

  const handleNewChat = () => {
    conversationStore.setActiveConversation(null)
    const currentPath = location.pathname
    if (currentPath === '/chat' || currentPath === '/stream') {
      window.location.reload()
    } else {
      navigate({ to: '/chat' })
    }
    setIsMobileOpen(false)
  }

  const handleSelectConversation = (conversationId: string) => {
    conversationStore.setActiveConversation(conversationId)
    const currentPath = location.pathname
    if (currentPath === '/chat' || currentPath === '/stream') {
      window.location.reload()
    } else {
      navigate({ to: '/chat' })
    }
    setIsMobileOpen(false)
  }

  const formatRelativeTime = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const truncateTitle = (title: string, maxLength: number = 13): string => {
    if (title.length <= maxLength) return title
    return title.slice(0, maxLength) + '...'
  }

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

  // Temporarily hidden as per requirements
  const footerItems: Array<{ icon: any; label: string; href: string }> = [
    // { icon: Key, label: 'Get API key', href: '/api-keys' },
    // { icon: Activity, label: 'View status', href: '/status' },
    // { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-card">
      {/* Collapse Button */}
      <div className="p-2 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-4 pt-0">
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleNewChat} className="w-full justify-center h-10 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>New chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button onClick={handleNewChat} className="w-full justify-start gap-2 h-10 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4" />
            New chat
          </Button>
        )}
      </div>

      <Separator className="bg-border" />

      {/* Navigation */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className={`space-y-2 ${isCollapsed ? 'p-2' : 'p-4'}`}>
            {/* Studio Accordion */}
            {isCollapsed ? (
              <TooltipProvider>
                {studioItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  
                  return (
                    <Tooltip key={item.label}>
                      <TooltipTrigger asChild>
                        <Link to={item.href} className="block">
                          <Button
                            variant="ghost"
                            className={`w-full justify-center h-9 ${
                              isActive
                                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </TooltipProvider>
            ) : (
              <Collapsible open={studioExpanded} onOpenChange={setStudioExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2 h-9 px-3 text-foreground hover:bg-accent">
                    {studioExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <Home className="h-4 w-4" />
                    <span className="text-sm font-semibold">Studio</span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-1 ml-6">
                  {studioItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.href
                    
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
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
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
                    {conversationState.conversations.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground text-xs">
                        No conversations yet
                      </div>
                    ) : (
                      conversationState.conversations.map((conv) => (
                        <Tooltip key={conv.id}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className={`w-full justify-start text-left h-auto p-2 hover:bg-accent group ${
                                conversationState.activeConversationId === conv.id ? 'bg-accent' : ''
                              }`}
                              onClick={() => handleSelectConversation(conv.id)}
                              aria-label={`Open conversation: ${conv.title}`}
                            >
                              <div className="flex items-start gap-2 w-full min-w-0">
                                <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1 mb-1">
                                    <span className="text-sm font-medium text-foreground">{truncateTitle(conv.title)}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {formatRelativeTime(conv.updatedAt)}
                                  </div>
                                </div>
                              </div>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <div className="max-w-xs">
                              <p className="font-medium">{conv.title}</p>
                              <p className="text-xs text-muted-foreground">{conv.modelName}</p>
                              <p className="text-xs text-muted-foreground">{conv.messages.length} messages</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))
                    )}
                  </CollapsibleContent>
                  </Collapsible>
                </CollapsibleContent>
              </Collapsible>
            )}
            
            {!isCollapsed && <Separator className="bg-border my-2" />}
            
            {/* Dashboard Accordion */}
            {isCollapsed ? (
              <TooltipProvider>
                {dashboardItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  
                  return (
                    <Tooltip key={item.label}>
                      <TooltipTrigger asChild>
                        <Link to={item.href} className="block">
                          <Button
                            variant="ghost"
                            className={`w-full justify-center h-9 ${
                              isActive
                                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </TooltipProvider>
            ) : (
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
                    const isActive = location.pathname === item.href
                    
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
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Button>
                      </Link>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </ScrollArea>
      </div>

      <Separator className="bg-border" />

      {/* Footer */}
      <div className="p-4 space-y-1">
        {isCollapsed ? (
          <TooltipProvider>
            {footerItems.map((item) => {
              const Icon = item.icon
              return (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-center h-9 text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
            
            {/* Profile Section */}
            <div className="pt-2 mt-2 border-t border-border">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-center h-9 text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>user@example.com</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex lg:flex-col lg:border-r lg:border-border lg:bg-card transition-all duration-200 overflow-hidden ${
        isCollapsed ? 'lg:w-16' : 'lg:w-72'
      }`}>
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
