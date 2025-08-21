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

    const amenities = await prisma.amenity.findMany({
      where: { businessUnitId },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(amenities)
  } catch (error) {
    console.error("[AMENITIES_GET]", error)
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
    const { name, description, icon, category, isActive, sortOrder } = body

    if (!name || !icon || !category) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const amenity = await prisma.amenity.create({
      data: {
        businessUnitId,
        name,
        description,
        icon,
        category,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0
      }
    })

    return NextResponse.json(amenity, { status: 201 })
  } catch (error) {
    console.error("[AMENITIES_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}