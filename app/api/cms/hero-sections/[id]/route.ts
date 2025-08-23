import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  id: string;
  [key: string]: string;
};

type PatchBody = {
  title?: unknown;
  subtitle?: unknown;
  backgroundImage?: unknown;
  ctaText?: unknown;
  ctaUrl?: unknown;
  isActive?: unknown;
  sortOrder?: unknown;
};

function isString(v: unknown): v is string {
  return typeof v === "string";
}
function isBoolean(v: unknown): v is boolean {
  return typeof v === "boolean";
}
function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

// PATCH: update a hero slide
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<RouteParams> } // Next.js 15: params is a Promise
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await ctx.params;

    const raw = await req.json().catch(() => null);
    if (raw === null || typeof raw !== "object") {
      return new NextResponse("Invalid request body", { status: 400 });
    }

    const body = raw as PatchBody;

    // Build a safe partial update object only with validated primitive types
    const data: {
      title?: string;
      subtitle?: string;
      backgroundImage?: string;
      ctaText?: string;
      ctaUrl?: string;
      isActive?: boolean;
      sortOrder?: number;
    } = {};

    if ("title" in body && isString(body.title)) {
      data.title = body.title;
    }

    // NOTE: we only accept strings — not `null`. If subtitle is nullable in DB and
    // you want to allow setting it to null, tell me and I'll add explicit handling.
    if ("subtitle" in body && isString(body.subtitle)) {
      data.subtitle = body.subtitle;
    }

    // backgroundImage: accept only string (no null) to match Prisma's expected type
    if ("backgroundImage" in body && isString(body.backgroundImage)) {
      data.backgroundImage = body.backgroundImage;
    }

    if ("ctaText" in body && isString(body.ctaText)) {
      data.ctaText = body.ctaText;
    }

    if ("ctaUrl" in body && isString(body.ctaUrl)) {
      data.ctaUrl = body.ctaUrl;
    }

    if ("isActive" in body && isBoolean(body.isActive)) {
      data.isActive = body.isActive;
    }

    if ("sortOrder" in body && isNumber(body.sortOrder)) {
      data.sortOrder = body.sortOrder;
    }

    // If nothing validated, reject
    if (Object.keys(data).length === 0) {
      return new NextResponse("No valid fields to update", { status: 400 });
    }

    const updatedHeroSlide = await prisma.heroSlide.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedHeroSlide);
  } catch (error) {
    console.error("[HERO_SLIDE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE: remove a hero slide
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<RouteParams> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await ctx.params;

    await prisma.heroSlide.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[HERO_SLIDE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
