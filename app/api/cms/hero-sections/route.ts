import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

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

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const businessUnitId = req.headers.get("x-business-unit-id")
    if (!businessUnitId) {
      return new NextResponse("Missing x-business-unit-id header", { status: 400 })
    }

    const body = await req.json()
    const { title, subtitle, backgroundImageUrl, ctaText, ctaLink, isActive, sortOrder } = body

    if (!title || !subtitle || !backgroundImageUrl || !ctaText || !ctaLink) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const heroSection = await prisma.heroSlide.create({
      data: {
        businessUnitId,
        title,
        subtitle,
        backgroundImage: backgroundImageUrl,
        ctaText,
        ctaUrl: ctaLink,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0
      }
    })

    return NextResponse.json(heroSection, { status: 201 })
  } catch (error) {
    console.error("[HERO_SECTIONS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}