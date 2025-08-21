// app/api/hero-slides/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET all active hero slides for a specific business unit
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessUnitId = searchParams.get("businessUnitId");

    if (!businessUnitId) {
      return new NextResponse("Missing businessUnitId parameter", { status: 400 });
    }

    const heroSlides = await prisma.heroSlide.findMany({
      where: { businessUnitId, isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json(heroSlides);
  } catch (error) {
    console.error("[HERO_SLIDES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST a new hero slide
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const businessUnitId = req.headers.get("x-business-unit-id");
    if (!businessUnitId) {
      return new NextResponse("Missing x-business-unit-id header", { status: 400 });
    }

    // Body with corrected field names to match schema
    const body = await req.json();
    const { title, subtitle, backgroundImage, ctaText, ctaUrl, isActive, sortOrder } = body;

    if (!title || !backgroundImage) {
      return new NextResponse("Missing required fields: title, backgroundImage", { status: 400 });
    }

    const heroSlide = await prisma.heroSlide.create({
      data: {
        businessUnitId,
        title,
        subtitle,
        backgroundImage,
        ctaText,
        ctaUrl,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0
      }
    });

    return NextResponse.json(heroSlide, { status: 201 });
  } catch (error) {
    console.error("[HERO_SLIDES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}