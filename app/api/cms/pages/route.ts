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

    const pages = await prisma.page.findMany({
      where: { businessUnitId },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error("[PAGES_GET]", error)
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
    const { title, slug, description, content, contentType, metaTitle, metaDescription, status } = body

    if (!title || !slug) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const page = await prisma.page.create({
      data: {
        businessUnitId,
        title,
        slug,
        description,
        content,
        contentType: contentType || 'HTML',
        metaTitle,
        metaDescription,
        status: status || 'DRAFT'
      }
    })

    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    console.error("[PAGES_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}