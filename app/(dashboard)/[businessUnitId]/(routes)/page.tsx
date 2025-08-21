"use client"

import { useState, useEffect, useCallback } from "react" // 1. Import useCallback
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Clock,
  XCircle,
  LogIn,
  LogOut,
  BedDouble,
  Percent,
  CalendarCheck,
  SprayCan,
  ConciergeBell,
} from "lucide-react"
import { toast } from "sonner"
import axios from "axios"
import Link from "next/link"

// This interface is correct
interface DashboardData {
  summary: {
    occupancyRate: number
    totalRevenue: number
    averageDailyRate: number
    guestsCheckedIn: number
    todaysArrivals: number
    todaysDepartures: number
  }
  housekeeping: {
    clean: number
    dirty: number
    outOfOrder: number
  }
  recentBookings: {
    id: string
    guestName: string
    checkInDate: string
    nights: number
    status: 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED'
  }[]
  todaysActivity: {
    id: string
    type: 'ARRIVAL' | 'DEPARTURE'
    guestName: string
    roomNumber: string | null
    status: 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT'
  }[]
  openServiceRequests: {
    id: string
    guestName: string
    roomNumber: string | null
    requestType: 'HOUSEKEEPING' | 'MAINTENANCE' | 'CONCIERGE' | 'ROOM_SERVICE'
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
    requestedAt: string
  }[]
}

const DashboardPage = () => {
  const params = useParams()
  const businessUnitId = params.businessUnitId as string
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d'>('today')

  // 2. Wrap fetchDashboardData in useCallback
  const fetchDashboardData = useCallback(async () => {
    if (!businessUnitId) return; // Guard clause
    try {
      setLoading(true)
      const response = await axios.get(`/api/${businessUnitId}/dashboard`, {
        headers: { 'x-business-unit-id': businessUnitId },
        params: { timeRange }
      })
      setData(response.data)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }, [businessUnitId, timeRange]) // Dependencies for the function itself

  // 3. Update useEffect to depend on the stable fetchDashboardData function
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      // 4. Added className to all members to fix the TypeScript error
      CONFIRMED: { variant: "default" as const, icon: CalendarCheck, className: "" },
      CHECKED_IN: { variant: "secondary" as const, icon: LogIn, className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700" },
      CHECKED_OUT: { variant: "outline" as const, icon: LogOut, className: "" },
      CANCELLED: { variant: "destructive" as const, icon: XCircle, className: "" },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "outline", icon: Clock, className: "" }
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className={`gap-1 ${config.className || ''}`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    )
  }
  
  const getActivityIcon = (type: string) => {
    const icons = {
      ARRIVAL: LogIn,
      DEPARTURE: LogOut,
      BOOKING: CalendarCheck,
      HOUSEKEEPING: SprayCan,
      MAINTENANCE: Activity,
      CONCIERGE: ConciergeBell,
    }
    return icons[type as keyof typeof icons] || Activity
  }

  // The rest of the component remains the same
  if (loading) {
    return (
      <div className="space-y-6">
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
        <Card className="h-64 animate-pulse"><CardContent className="h-full bg-muted rounded-lg"></CardContent></Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">No dashboard data available</h3>
        <p className="text-muted-foreground">There might be an issue with fetching data for this property.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            An overview of your property&quote;s performance and daily activities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={timeRange === 'today' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('today')}>Today</Button>
          <Button variant={timeRange === '7d' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('7d')}>7D</Button>
          <Button variant={timeRange === '30d' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('30d')}>30D</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.occupancyRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{data.summary.guestsCheckedIn} rooms occupied</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">For the selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.averageDailyRate)}</div>
            <p className="text-xs text-muted-foreground">ADR for selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guests Checked In</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.guestsCheckedIn}</div>
            <p className="text-xs text-muted-foreground">Currently in-house</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&quote;s Arrivals</CardTitle>
            <LogIn className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.todaysArrivals}</div>
            <p className="text-xs text-muted-foreground">Guests scheduled to check in today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&quote;s Departures</CardTitle>
            <LogOut className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.todaysDepartures}</div>
            <p className="text-xs text-muted-foreground">Guests scheduled to check out today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Today&quote;s Activity</CardTitle>
            <CardDescription>All scheduled arrivals and departures for today.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.todaysActivity.length > 0 ? (
                data.todaysActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${activity.type === 'ARRIVAL' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                          <Icon className={`h-4 w-4 ${activity.type === 'ARRIVAL' ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{activity.guestName}</p>
                          <p className="text-xs text-muted-foreground">Room: {activity.roomNumber || 'TBD'}</p>
                        </div>
                      </div>
                      {getStatusBadge(activity.status)}
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">No arrivals or departures scheduled today.</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><SprayCan className="h-5 w-5" />Housekeeping</CardTitle>
            <CardDescription>Current status of all rooms.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border-l-4 border-green-500 rounded">
              <span className="font-medium text-sm text-green-800 dark:text-green-300">Clean</span>
              <span className="font-bold text-lg text-green-900 dark:text-green-200">{data.housekeeping.clean}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 border-l-4 border-orange-500 rounded">
              <span className="font-medium text-sm text-orange-800 dark:text-orange-300">Dirty</span>
              <span className="font-bold text-lg text-orange-900 dark:text-orange-200">{data.housekeeping.dirty}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border-l-4 border-gray-500 rounded">
              <span className="font-medium text-sm text-gray-800 dark:text-gray-300">Out of Order</span>
              <span className="font-bold text-lg text-gray-900 dark:text-gray-200">{data.housekeeping.outOfOrder}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link href={`/${businessUnitId}/reservations/new`}>
                <CalendarCheck className="h-6 w-6" />
                <span className="text-sm">New Reservation</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link href={`/${businessUnitId}/guests`}>
                <Users className="h-6 w-6" />
                <span className="text-sm">Find Guest</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link href={`/${businessUnitId}/rooms`}>
                <BedDouble className="h-6 w-6" />
                <span className="text-sm">View Room Rack</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link href={`/${businessUnitId}/operations/housekeeping`}>
                <SprayCan className="h-6 w-6" />
                <span className="text-sm">Manage Housekeeping</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage