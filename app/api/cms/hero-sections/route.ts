import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// This is an API route for managing hero slides.
// It includes a GET method to fetch hero slides for a specific business unit
// and a POST method to create a new hero slide, with robust authorization checks.

/**
 * GET handler to retrieve hero sections for a specific business unit.
 * @param req The NextRequest object containing the businessUnitId as a search parameter.
 * @returns A NextResponse containing the hero sections or an error response.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const businessUnitId = searchParams.get("businessUnitId")

    if (!businessUnitId) {
      return new NextResponse("Missing businessUnitId parameter", { status: 400 })
    }

    const heroSections = await prisma.heroSlide.findMany({
      where: { businessUnitId },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(heroSections)
  } catch (error) {
    console.error("[HERO_SECTIONS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

/**
 * POST handler to create a new hero section.
 * Includes robust authorization to ensure the user has permission to manage content.
 * @param req The NextRequest object containing the new hero section data.
 * @returns A NextResponse containing the newly created hero section or an error response.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the user session.
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // 2. Get the business unit ID from the request headers.
    const businessUnitId = req.headers.get("x-business-unit-id")
    if (!businessUnitId) {
      return new NextResponse("Missing x-business-unit-id header", { status: 400 })
    }

    // 3. Authorize the user: check if they have permission to manage content for this business unit.
    const userRole = await prisma.userBusinessUnitRole.findFirst({
      where: {
        userId: session.user.id,
        businessUnitId: businessUnitId,
        // Eager load the role and its permissions to check for the required permission.
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

    // If the user does not have an assigned role or that role lacks the 'manage:content' permission, deny access.
    if (!userRole || userRole.role.permissions.length === 0) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // 4. Parse and validate the request body.
    const body = await req.json()
    const { title, subtitle, backgroundImageUrl, ctaText, ctaLink, isActive, sortOrder } = body

    if (!title || !subtitle || !backgroundImageUrl || !ctaText || !ctaLink) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // 5. Create the new hero slide.
    const heroSection = await prisma.heroSlide.create({
      data: {
        businessUnitId,
        title,
        subtitle,
        // Map request body fields to Prisma schema fields.
        backgroundImage: backgroundImageUrl,
        ctaText,
        ctaUrl: ctaLink,
        // Use nullish coalescing to safely apply default values if not provided.
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
        // isPublished is set to true by default, as new content is typically published.
      }
    })

    return NextResponse.json(heroSection, { status: 201 })
  } catch (error) {
    console.error("[HERO_SECTIONS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
