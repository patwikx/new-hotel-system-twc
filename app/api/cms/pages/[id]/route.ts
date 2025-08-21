import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const page = await prisma.page.findUnique({
      where: { id: params.id }
    })

    if (!page) {
      return new NextResponse("Page not found", { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error("[PAGE_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, slug, description, content, contentType, metaTitle, metaDescription, status } = body

    const page = await prisma.page.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        description,
        content,
        contentType,
        metaTitle,
        metaDescription,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : undefined
      }
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error("[PAGE_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.page.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[PAGE_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}