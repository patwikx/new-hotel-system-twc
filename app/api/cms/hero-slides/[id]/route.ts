// app/api/hero-slides/[heroSlideId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH (update) a specific hero slide
export async function PATCH(
  req: NextRequest,
  { params }: { params: { heroSlideId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, subtitle, backgroundImage, ctaText, ctaUrl, isActive, sortOrder } = body;

    const heroSlide = await prisma.heroSlide.update({
      where: { id: params.heroSlideId },
      data: { title, subtitle, backgroundImage, ctaText, ctaUrl, isActive, sortOrder },
    });

    return NextResponse.json(heroSlide);
  } catch (error) {
    console.error("[HERO_SLIDE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE a specific hero slide
export async function DELETE(
  req: NextRequest,
  { params }: { params: { heroSlideId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.heroSlide.delete({
      where: { id: params.heroSlideId },
    });

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error("[HERO_SLIDE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}