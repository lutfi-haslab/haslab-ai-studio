import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  MessageSquare,
  Code,
  Image,
  Download,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Activity
} from 'lucide-react'

export const Route = createFileRoute('/usage')({
  component: Usage,
})

interface UsageMetric {
  name: string
  value: number
  unit: string
  change: number
  trend: 'up' | 'down'
}

interface ServiceUsage {
  service: string
  requests: number
  cost: number
  limit: number
  percentage: number
}

function Usage() {
  const [timeRange, setTimeRange] = useState('7d')
  
  const metrics: UsageMetric[] = [
    { name: 'API Calls', value: 1247, unit: 'requests', change: 12, trend: 'up' },
    { name: 'Chat Messages', value: 856, unit: 'messages', change: -5, trend: 'down' },
    { name: 'Code Generation', value: 342, unit: 'requests', change: 23, trend: 'up' },
    { name: 'Media Generated', value: 89, unit: 'images', change: 18, trend: 'up' }
  ]

  const serviceUsage: ServiceUsage[] = [
    { service: 'Gemini Pro', requests: 1247, cost: 12.47, limit: 2000, percentage: 62 },
    { service: 'Code Generation', requests: 342, cost: 8.55, limit: 500, percentage: 68 },
    { service: 'Image Generation', requests: 89, cost: 4.45, limit: 100, percentage: 89 },
    { service: 'Text Analysis', requests: 156, cost: 2.34, limit: 1000, percentage: 16 }
  ]

  const dailyUsage = [
    { date: '2024-01-08', requests: 145 },
    { date: '2024-01-09', requests: 232 },
    { date: '2024-01-10', requests: 189 },
    { date: '2024-01-11', requests: 276 },
    { date: '2024-01-12', requests: 198 },
    { date: '2024-01-13', requests: 145 },
    { date: '2024-01-14', requests: 167 }
  ]

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Usage & Analytics</h1>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Monitor your AI service usage, costs, and performance metrics
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric) => (
                <Card key={metric.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      {metric.name}
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{metric.value.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">{metric.unit}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-xs ${
                        metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {metric.trend === 'up' ? '+' : ''}{metric.change}%
                      </span>
                      <span className="text-xs text-muted-foreground">vs last period</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Daily Usage Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2 p-4">
                  {dailyUsage.map((day, index) => {
                    const maxRequests = Math.max(...dailyUsage.map(d => d.requests))
                    const height = (day.requests / maxRequests) * 100
                    
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          {day.requests}
                        </div>
                        <div
                          className="w-full bg-primary rounded-t-sm min-h-[4px] transition-all hover:bg-primary/80"
                          style={{ height: `${height}%` }}
                        />
                        <div className="text-xs text-muted-foreground">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Service Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Service Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {serviceUsage.map((service) => (
                    <div key={service.service} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            {service.service === 'Gemini Pro' && <MessageSquare className="h-4 w-4" />}
                            {service.service === 'Code Generation' && <Code className="h-4 w-4" />}
                            {service.service === 'Image Generation' && <Image className="h-4 w-4" />}
                            {service.service === 'Text Analysis' && <BarChart3 className="h-4 w-4" />}
                            <span className="text-sm font-medium">{service.service}</span>
                          </div>
                          <Badge variant={service.percentage > 80 ? 'destructive' : 'secondary'} className="text-xs">
                            {service.percentage}%
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {service.requests}/{service.limit}
                        </span>
                      </div>
                      <Progress value={service.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{service.requests} requests</span>
                        <span>${service.cost.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">$27.81</div>
                      <div className="text-sm text-muted-foreground">Total this period</div>
                    </div>
                    
                    <div className="space-y-3">
                      {serviceUsage.map((service) => (
                        <div key={service.service} className="flex items-center justify-between">
                          <span className="text-sm">{service.service}</span>
                          <span className="font-medium">${service.cost.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Estimated next bill</span>
                        <span className="text-foreground font-medium">$35.20</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'Code generated', service: 'Build Assistant', time: '2 minutes ago', cost: '$0.12' },
                    { action: 'Chat conversation', service: 'Gemini Pro', time: '5 minutes ago', cost: '$0.05' },
                    { action: 'Image generated', service: 'Media Generator', time: '12 minutes ago', cost: '$0.08' },
                    { action: 'Text analysis', service: 'Analytics API', time: '18 minutes ago', cost: '$0.03' },
                    { action: 'Code review', service: 'Build Assistant', time: '25 minutes ago', cost: '$0.07' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <div className="text-sm font-medium">{activity.action}</div>
                        <div className="text-xs text-muted-foreground">{activity.service}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{activity.cost}</div>
                        <div className="text-xs text-muted-foreground">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}