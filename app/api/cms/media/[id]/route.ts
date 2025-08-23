import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  id: string;
  [key: string]: string;
};

type PatchBody = {
  title?: unknown;
  description?: unknown;
  category?: unknown;
  tags?: unknown;
  altText?: unknown;
};

function isString(v: unknown): v is string {
  return typeof v === "string";
}
function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((item) => typeof item === "string");
}

// DELETE handler (uses deleteMany so we can include businessUnitId filter)
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<RouteParams> } // Next.js 15: params is a Promise
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await ctx.params;

    const { searchParams } = new URL(req.url);
    const businessUnitId = searchParams.get("businessUnitId");

    if (!businessUnitId) {
      return new NextResponse("Missing businessUnitId parameter", { status: 400 });
    }

    // Optional: enforce admin/ownership check here if needed
    // const hasAdminAccess = session.user.assignments.some(...)
    // if (!hasAdminAccess) return new NextResponse("Forbidden", { status: 403 })

    // deleteMany allows non-unique composite where; returns count
    const result = await prisma.mediaItem.deleteMany({
      where: { id, businessUnitId },
    });

    if (result.count === 0) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[MEDIA_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PATCH handler (validates body and only sends correctly-typed fields to Prisma)
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

    const data: {
      title?: string;
      description?: string;
      category?: string;
      tags?: string[];
      altText?: string;
    } = {};

    if ("title" in body && isString(body.title)) data.title = body.title;
    if ("description" in body && isString(body.description)) data.description = body.description;
    if ("category" in body && isString(body.category)) data.category = body.category;
    if ("tags" in body && isStringArray(body.tags)) data.tags = body.tags;
    if ("altText" in body && isString(body.altText)) data.altText = body.altText;

    // Remove undefined keys
    for (const key of Object.keys(data) as Array<keyof typeof data>) {
      if (data[key] === undefined) {
        delete data[key];
      }
    }

    if (Object.keys(data).length === 0) {
      return new NextResponse("No valid fields to update", { status: 400 });
    }

    const mediaItem = await prisma.mediaItem.update({
      where: { id },
      data,
    });

    return NextResponse.json(mediaItem);
  } catch (error) {
    console.error("[MEDIA_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
