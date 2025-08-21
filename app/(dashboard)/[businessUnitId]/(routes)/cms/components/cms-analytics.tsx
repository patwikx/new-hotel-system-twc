"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  Eye, 
  Users, 
  MessageSquare, 
  Globe, 
  Calendar,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

interface AnalyticsData {
  pageViews: {
    total: number
    change: number
    trend: 'up' | 'down'
  }
  uniqueVisitors: {
    total: number
    change: number
    trend: 'up' | 'down'
  }
  contactForms: {
    total: number
    change: number
    trend: 'up' | 'down'
  }
  newsletterSignups: {
    total: number
    change: number
    trend: 'up' | 'down'
  }
  topPages: {
    slug: string
    title: string
    views: number
  }[]
  recentActivity: {
    type: string
    description: string
    timestamp: string
  }[]
}

interface CMSAnalyticsProps {
  businessUnitId: string
}

export const CMSAnalytics = ({ businessUnitId }: CMSAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/cms/analytics?businessUnitId=${businessUnitId}&timeRange=${timeRange}`)
      setAnalytics(response.data)
    } catch (error) {
      toast.error("Failed to fetch analytics")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (businessUnitId) {
      fetchAnalytics()
    }
  }, [businessUnitId, timeRange])

  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? (
      <ArrowUp className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDown className="h-4 w-4 text-red-500" />
    )
  }

  const getTrendColor = (trend: 'up' | 'down') => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600'
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded mb-2 w-1/2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">No analytics data available</h3>
        <p className="text-muted-foreground">Analytics data will appear here once your website starts receiving traffic.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Website Analytics</h3>
        <div className="flex items-center gap-2">
          <Badge 
            variant={timeRange === '7d' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </Badge>
          <Badge 
            variant={timeRange === '30d' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </Badge>
          <Badge 
            variant={timeRange === '90d' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pageViews.total.toLocaleString()}</div>
            <div className={`text-xs flex items-center gap-1 ${getTrendColor(analytics.pageViews.trend)}`}>
              {getTrendIcon(analytics.pageViews.trend)}
              {Math.abs(analytics.pageViews.change)}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueVisitors.total.toLocaleString()}</div>
            <div className={`text-xs flex items-center gap-1 ${getTrendColor(analytics.uniqueVisitors.trend)}`}>
              {getTrendIcon(analytics.uniqueVisitors.trend)}
              {Math.abs(analytics.uniqueVisitors.change)}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Forms</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.contactForms.total}</div>
            <div className={`text-xs flex items-center gap-1 ${getTrendColor(analytics.contactForms.trend)}`}>
              {getTrendIcon(analytics.contactForms.trend)}
              {Math.abs(analytics.contactForms.change)}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Newsletter Signups</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.newsletterSignups.total}</div>
            <div className={`text-xs flex items-center gap-1 ${getTrendColor(analytics.newsletterSignups.trend)}`}>
              {getTrendIcon(analytics.newsletterSignups.trend)}
              {Math.abs(analytics.newsletterSignups.change)}% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages in the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPages.map((page, index) => (
                <div key={page.slug} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{page.title}</p>
                      <p className="text-xs text-muted-foreground">/{page.slug}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{page.views} views</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest content management activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}