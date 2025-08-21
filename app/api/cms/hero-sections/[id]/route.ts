import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// --- ADD THIS FUNCTION ---
// Handles PATCH requests to update a hero slide
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, subtitle, backgroundImage, ctaText, ctaUrl, isActive, sortOrder } = body;

    const updatedHeroSlide = await prisma.heroSlide.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        subtitle,
        backgroundImage,
        ctaText,
        ctaUrl,
        isActive,
        sortOrder,
      },
    });

    return NextResponse.json(updatedHeroSlide);
  } catch (error) {
    console.error("[HERO_SLIDE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Your existing DELETE function remains the same
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // You could add an ownership check here if needed

    await prisma.heroSlide.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 }); // 204 No Content is standard for successful deletion
  } catch (error) {
    console.error("[HERO_SLIDE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}