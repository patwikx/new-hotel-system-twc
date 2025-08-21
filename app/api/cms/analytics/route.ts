import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const businessUnitId = searchParams.get("businessUnitId")
    const timeRange = searchParams.get("timeRange") || '30d'

    if (!businessUnitId) {
      return new NextResponse("Missing businessUnitId parameter", { status: 400 })
    }

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // For now, return mock data since we don't have analytics tracking yet
    // In a real implementation, you'd integrate with Google Analytics or similar
    const mockAnalytics = {
      pageViews: {
        total: Math.floor(Math.random() * 10000) + 1000,
        change: Math.floor(Math.random() * 50) - 25,
        trend: Math.random() > 0.5 ? 'up' : 'down'
      },
      uniqueVisitors: {
        total: Math.floor(Math.random() * 5000) + 500,
        change: Math.floor(Math.random() * 30) - 15,
        trend: Math.random() > 0.5 ? 'up' : 'down'
      },
      contactForms: {
        total: await prisma.contactForm.count({
          where: { 
            businessUnitId,
            createdAt: { gte: startDate }
          }
        }),
        change: Math.floor(Math.random() * 20) - 10,
        trend: Math.random() > 0.5 ? 'up' : 'down'
      },
      newsletterSignups: {
        total: await prisma.newsletter.count({
          where: { 
            businessUnitId,
            createdAt: { gte: startDate }
          }
        }),
        change: Math.floor(Math.random() * 15) - 7,
        trend: Math.random() > 0.5 ? 'up' : 'down'
      },
      topPages: [
        { slug: '', title: 'Homepage', views: Math.floor(Math.random() * 1000) + 100 },
        { slug: 'rooms', title: 'Rooms & Suites', views: Math.floor(Math.random() * 800) + 80 },
        { slug: 'amenities', title: 'Amenities', views: Math.floor(Math.random() * 600) + 60 },
        { slug: 'contact', title: 'Contact Us', views: Math.floor(Math.random() * 400) + 40 },
        { slug: 'about', title: 'About Us', views: Math.floor(Math.random() * 300) + 30 }
      ],
      recentActivity: [
        {
          type: 'content_update',
          description: 'Updated hero section content',
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'testimonial_added',
          description: 'Added new customer testimonial',
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'gallery_update',
          description: 'Added 3 new gallery images',
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    }

    return NextResponse.json(mockAnalytics)
  } catch (error) {
    console.error("[ANALYTICS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}