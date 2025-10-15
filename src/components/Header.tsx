import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Menu,
  Search,
  Settings,
  User,
  Zap,
  HelpCircle,
  Moon,
  Sun
} from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'

export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-4 sticky top-0 z-50">
      {/* Left - Logo and Brand */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground hover:text-foreground">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/25">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-foreground">Haslab AI Studio</h1>
          </div>
        </div>
      </div>

      {/* Center - Search Bar */}
      <div className="hidden md:flex flex-1 max-w-lg mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations, models, or documentation..."
            className="w-full h-10 pl-10 pr-4 text-sm border border-border rounded-lg bg-background/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Right - Actions and User */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4" />
        </Button>

        <Badge variant="secondary" className="hidden md:flex items-center gap-1 text-xs bg-primary/10 text-primary border-primary/20">
          <div className="h-2 w-2 rounded-full bg-primary" />
          Gemini Pro
        </Badge>

        <Avatar className="h-9 w-9 border border-border">
          <AvatarFallback className="bg-muted text-muted-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
