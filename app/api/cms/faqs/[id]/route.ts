import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const businessUnitId = searchParams.get("businessUnitId")

    if (!businessUnitId) {
      return new NextResponse("Missing businessUnitId parameter", { status: 400 })
    }

    await prisma.fAQ.delete({
      where: { 
        id: params.id,
        businessUnitId 
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[FAQ_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}