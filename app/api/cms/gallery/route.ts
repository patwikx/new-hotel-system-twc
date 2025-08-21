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

    const gallery = await prisma.mediaItem.findMany({
      where: { 
        businessUnitId,
        category: 'gallery',
        isActive: true 
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(gallery)
  } catch (error) {
    console.error("[GALLERY_GET]", error)
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
    const { title, description, imageUrl, category, isActive, sortOrder } = body

    if (!title || !imageUrl || !category) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const galleryItem = await prisma.mediaItem.create({
      data: {
        businessUnitId,
        filename: imageUrl.split('/').pop() || 'image',
        originalName: title,
        mimeType: 'image/jpeg',
        size: 0,
        url: imageUrl,
        title,
        description,
        category,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(galleryItem, { status: 201 })
  } catch (error) {
    console.error("[GALLERY_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}