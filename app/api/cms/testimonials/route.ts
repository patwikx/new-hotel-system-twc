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

    const testimonials = await prisma.testimonial.findMany({
      where: { businessUnitId },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error("[TESTIMONIALS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { businessUnitId, guestName, guestTitle, content, rating, imageUrl, isActive, sortOrder } = body

    if (!businessUnitId || !guestName || !content || !rating) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        businessUnitId,
        guestName,
        guestTitle,
        content,
        rating: parseInt(rating),
        guestImage: imageUrl || null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0
      }
    })

    return NextResponse.json(testimonial, { status: 201 })
  } catch (error) {
    console.error("[TESTIMONIALS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}