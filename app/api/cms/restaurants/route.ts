import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET handler to retrieve restaurants.
 * If businessUnitId is provided, filters by business unit.
 * If not provided, returns all restaurants across all business units.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const businessUnitId = searchParams.get("businessUnitId")

    // Build the where clause conditionally
    const whereClause = businessUnitId ? { businessUnitId } : {}

    const restaurants = await prisma.restaurant.findMany({
      where: whereClause,
      include: {
        businessUnit: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      },
      orderBy: [
        { businessUnitId: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(restaurants)
  } catch (error) {
    console.error("[RESTAURANTS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

/**
 * POST handler to create a new restaurant.
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
      name, 
      slug, 
      description, 
      shortDesc,
      type, 
      cuisine = [], 
      location,
      phone,
      email,
      operatingHours,
      features = [],
      priceRange,
      acceptsReservations = true,
      featuredImage,
      images = [],
      isActive = true,
      isPublished = false,
      isFeatured = false 
    } = body

    if (!name || !slug || !description || !type) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Create the restaurant
    const restaurant = await prisma.restaurant.create({
      data: {
        businessUnitId,
        name,
        slug,
        description,
        shortDesc,
        type,
        cuisine,
        location,
        phone,
        email,
        operatingHours,
        features,
        priceRange,
        acceptsReservations,
        featuredImage,
        images,
        isActive,
        isPublished,
        isFeatured,
        sortOrder: 0
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

    return NextResponse.json(restaurant, { status: 201 })
  } catch (error) {
    console.error("[RESTAURANTS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}