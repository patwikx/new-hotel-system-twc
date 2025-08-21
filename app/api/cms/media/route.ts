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

    const media = await prisma.mediaItem.findMany({
      where: { businessUnitId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error("[MEDIA_GET]", error)
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
    const { filename, originalName, mimeType, size, url, thumbnailUrl, title, description, category, tags } = body

    if (!filename || !originalName || !mimeType || !url) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const mediaItem = await prisma.mediaItem.create({
      data: {
        businessUnitId,
        filename,
        originalName,
        mimeType,
        size: size || 0,
        url,
        thumbnailUrl,
        title,
        description,
        category,
        tags: tags || []
      }
    })

    return NextResponse.json(mediaItem, { status: 201 })
  } catch (error) {
    console.error("[MEDIA_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}