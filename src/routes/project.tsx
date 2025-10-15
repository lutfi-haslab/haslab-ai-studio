import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Folder,
  Plus,
  GitBranch,
  Clock,
  Users,
  Code,
  FileText,
  MoreVertical,
  Star,
  Archive,
  Settings,
  Search,
  Filter
} from 'lucide-react'

export const Route = createFileRoute('/project')({
  component: Project,
})

interface ProjectItem {
  id: string
  name: string
  description: string
  status: 'active' | 'archived' | 'draft'
  progress: number
  collaborators: number
  lastModified: Date
  type: 'web-app' | 'mobile-app' | 'api' | 'ml-model'
  technologies: string[]
  isStarred?: boolean
}

function Project() {
  const [projects] = useState<ProjectItem[]>([
    {
      id: '1',
      name: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution with React and Node.js',
      status: 'active',
      progress: 75,
      collaborators: 4,
      lastModified: new Date(),
      type: 'web-app',
      technologies: ['React', 'Node.js', 'MongoDB'],
      isStarred: true
    },
    {
      id: '2',
      name: 'Mobile Chat App',
      description: 'Real-time messaging application for iOS and Android',
      status: 'active',
      progress: 45,
      collaborators: 2,
      lastModified: new Date(Date.now() - 86400000),
      type: 'mobile-app',
      technologies: ['React Native', 'Firebase', 'Socket.io']
    },
    {
      id: '3',
      name: 'Data Analytics API',
      description: 'RESTful API for processing and analyzing user data',
      status: 'draft',
      progress: 20,
      collaborators: 1,
      lastModified: new Date(Date.now() - 172800000),
      type: 'api',
      technologies: ['Python', 'FastAPI', 'PostgreSQL']
    },
    {
      id: '4',
      name: 'Image Classification Model',
      description: 'Machine learning model for automated image categorization',
      status: 'active',
      progress: 90,
      collaborators: 3,
      lastModified: new Date(Date.now() - 3600000),
      type: 'ml-model',
      technologies: ['Python', 'TensorFlow', 'OpenCV']
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'draft': return 'bg-yellow-500'
      case 'archived': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web-app': return '🌐'
      case 'mobile-app': return '📱'
      case 'api': return '⚡'
      case 'ml-model': return '🤖'
      default: return '📁'
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Folder className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Projects</h1>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
          <p className="text-muted-foreground">
            Manage and track your development projects, collaborate with team members
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto p-6 h-full">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.length}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  In development
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.max(...projects.map(p => p.collaborators))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all projects
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Completion rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full h-10 pl-10 pr-4 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Projects Grid */}
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getTypeIcon(project.type)}</span>
                        <div>
                          <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                            <span className="text-xs text-muted-foreground capitalize">{project.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {project.isStarred && (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.technologies.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{project.collaborators}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{project.lastModified.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}