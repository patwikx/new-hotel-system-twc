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

    const features = await prisma.contentItem.findMany({
      where: { 
        businessUnitId,
        section: 'features'
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(features)
  } catch (error) {
    console.error("[FEATURES_GET]", error)
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
    const { title, description, iconName, isActive, sortOrder } = body

    if (!title || !description || !iconName) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const feature = await prisma.contentItem.create({
      data: {
        businessUnitId,
        key: `feature_${Date.now()}`,
        section: 'features',
        name: title,
        description,
        content: JSON.stringify({
          title,
          description,
          iconName,
          sortOrder: sortOrder ?? 0
        }),
        contentType: 'JSON',
        status: isActive ? 'PUBLISHED' : 'DRAFT',
        createdById: session.user.id
      }
    })

    return NextResponse.json(feature, { status: 201 })
  } catch (error) {
    console.error("[FEATURES_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}