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

    const faqs = await prisma.fAQ.findMany({
      where: { businessUnitId },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(faqs)
  } catch (error) {
    console.error("[FAQS_GET]", error)
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
    const { question, answer, category, isActive, sortOrder } = body

    if (!question || !answer || !category) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const faq = await prisma.fAQ.create({
      data: {
        businessUnitId,
        question,
        answer,
        category,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0
      }
    })

    return NextResponse.json(faq, { status: 201 })
  } catch (error) {
    console.error("[FAQS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}