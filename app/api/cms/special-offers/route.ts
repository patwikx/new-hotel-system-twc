import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET handler to retrieve special offers.
 * If businessUnitId is provided, filters by business unit.
 * If not provided, returns all offers across all business units.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const businessUnitId = searchParams.get("businessUnitId")

    // Build the where clause conditionally
    const whereClause = businessUnitId ? { businessUnitId } : {}

    const offers = await prisma.specialOffer.findMany({
      where: whereClause,
      include: {
        businessUnit: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        },
        roomTypes: {
          include: {
            roomType: {
              select: {
                id: true,
                name: true,
                displayName: true
              }
            }
          }
        }
      },
      orderBy: [
        { businessUnitId: 'asc' },
        { isFeatured: 'desc' },
        { isPinned: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(offers)
  } catch (error) {
    console.error("[SPECIAL_OFFERS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

/**
 * POST handler to create a new special offer.
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
      subtitle,
      description,
      shortDesc,
      type,
      offerPrice,
      originalPrice,
      currency = "PHP",
      validFrom,
      validTo,
      bookingDeadline,
      stayPeriodFrom,
      stayPeriodTo,
      minNights = 1,
      maxNights,
      inclusions = [],
      exclusions = [],
      termsConditions,
      featuredImage,
      images = [],
      promoCode,
      requiresCode = false,
      maxUses,
      maxPerGuest = 1,
      isPublished = false,
      isFeatured = false,
      isPinned = false,
      roomTypeIds = []
    } = body

    if (!title || !slug || !description || !type || !offerPrice || !validFrom || !validTo) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Create the special offer
    const offer = await prisma.specialOffer.create({
      data: {
        businessUnitId,
        title,
        slug,
        subtitle,
        description,
        shortDesc,
        type,
        status: 'DRAFT',
        offerPrice: parseFloat(offerPrice),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        currency,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        bookingDeadline: bookingDeadline ? new Date(bookingDeadline) : null,
        stayPeriodFrom: stayPeriodFrom ? new Date(stayPeriodFrom) : null,
        stayPeriodTo: stayPeriodTo ? new Date(stayPeriodTo) : null,
        minNights,
        maxNights,
        inclusions,
        exclusions,
        termsConditions,
        featuredImage,
        images,
        promoCode,
        requiresCode,
        maxUses,
        maxPerGuest,
        isPublished,
        isFeatured,
        isPinned,
        sortOrder: 0,
        // Create room type associations if provided
        roomTypes: {
          create: roomTypeIds.map((roomTypeId: string) => ({
            roomTypeId
          }))
        }
      },
      include: {
        businessUnit: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        },
        roomTypes: {
          include: {
            roomType: {
              select: {
                id: true,
                name: true,
                displayName: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(offer, { status: 201 })
  } catch (error) {
    console.error("[SPECIAL_OFFERS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}