import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET handler to retrieve events.
 * If businessUnitId is provided, filters by business unit.
 * If not provided, returns all events across all business units.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const businessUnitId = searchParams.get("businessUnitId")

    // Build the where clause conditionally
    const whereClause = businessUnitId ? { businessUnitId } : {}

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        businessUnit: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        },
        bookings: {
          select: {
            id: true,
            status: true,
            partySize: true
          }
        }
      },
      orderBy: [
        { businessUnitId: 'asc' },
        { isFeatured: 'desc' },
        { isPinned: 'desc' },
        { sortOrder: 'asc' },
        { startDate: 'asc' }
      ]
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("[EVENTS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

/**
 * POST handler to create a new event.
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate the user session
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get the business unit ID from the request headers
    const businessUnitId = req.headers.get("x-business-unit-id")
    if (!businessUnitId) {
      return new NextResponse("Missing x-business-unit-id header", { status: 400 })
    }

    // Authorize the user
    const userRole = await prisma.userBusinessUnitRole.findFirst({
      where: {
        userId: session.user.id,
        businessUnitId: businessUnitId,
      },
      include: {
        role: {
          include: {
            permissions: {
              where: {
                permission: {
                  name: 'manage:content'
                }
              }
            }
          }
        }
      }
    });

    if (!userRole || userRole.role.permissions.length === 0) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Parse and validate the request body
    const body = await req.json()
    const { 
      title,
      slug,
      description,
      shortDesc,
      type,
      status = 'PLANNING',
      category = [],
      tags = [],
      startDate,
      endDate,
      startTime,
      endTime,
      timezone = 'Asia/Manila',
      isMultiDay = false,
      isRecurring = false,
      recurrenceRule,
      venue,
      venueDetails,
      venueCapacity,
      isFree = true,
      ticketPrice,
      currency = 'PHP',
      requiresBooking = false,
      maxAttendees,
      waitlistEnabled = false,
      bookingOpenDate,
      bookingCloseDate,
      minAge,
      maxAge,
      isAdultsOnly = false,
      isFamilyEvent = true,
      requirements = [],
      includes = [],
      excludes = [],
      featuredImage,
      images = [],
      videoUrl,
      fullDetails,
      highlights = [],
      hostName,
      hostBio,
      contactInfo,
      isPublished = false,
      isFeatured = false,
      isPinned = false
    } = body

    if (!title || !slug || !description || !type || !startDate || !endDate || !venue) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Create the event
    const event = await prisma.event.create({
      data: {
        businessUnitId,
        title,
        slug,
        description,
        shortDesc,
        type,
        status,
        category,
        tags,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime,
        endTime,
        timezone,
        isMultiDay,
        isRecurring,
        recurrenceRule,
        venue,
        venueDetails,
        venueCapacity,
        isFree,
        ticketPrice: ticketPrice ? parseFloat(ticketPrice) : null,
        currency,
        requiresBooking,
        maxAttendees,
        currentAttendees: 0,
        waitlistEnabled,
        bookingOpenDate: bookingOpenDate ? new Date(bookingOpenDate) : null,
        bookingCloseDate: bookingCloseDate ? new Date(bookingCloseDate) : null,
        minAge,
        maxAge,
        isAdultsOnly,
        isFamilyEvent,
        requirements,
        includes,
        excludes,
        featuredImage,
        images,
        videoUrl,
        fullDetails,
        highlights,
        hostName,
        hostBio,
        contactInfo,
        isPublished,
        isFeatured,
        isPinned,
        sortOrder: 0,
        viewCount: 0,
        clickCount: 0
      },
      include: {
        businessUnit: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      }
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("[EVENTS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}