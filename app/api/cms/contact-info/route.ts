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

    const contactInfo = await prisma.contentItem.findMany({
      where: { 
        businessUnitId,
        section: 'contact'
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(contactInfo)
  } catch (error) {
    console.error("[CONTACT_INFO_GET]", error)
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
    const { type, label, value, iconName, isActive, sortOrder } = body

    if (!type || !label || !value || !iconName) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const contactInfo = await prisma.contentItem.create({
      data: {
        businessUnitId,
        key: `contact_${type.toLowerCase()}_${Date.now()}`,
        section: 'contact',
        name: label,
        content: JSON.stringify({
          type,
          label,
          value,
          iconName,
          sortOrder: sortOrder ?? 0
        }),
        contentType: 'JSON',
        status: isActive ? 'PUBLISHED' : 'DRAFT',
        createdById: session.user.id
      }
    })

    return NextResponse.json(contactInfo, { status: 201 })
  } catch (error) {
    console.error("[CONTACT_INFO_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}