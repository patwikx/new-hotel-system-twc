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

    const config = await prisma.websiteConfiguration.findUnique({
      where: { businessUnitId }
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error("[WEBSITE_CONFIG_GET]", error)
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

    const config = await prisma.websiteConfiguration.upsert({
      where: { businessUnitId },
      update: body,
      create: {
        businessUnitId,
        ...body
      }
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error("[WEBSITE_CONFIG_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}