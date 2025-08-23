// app/api/pages/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ContentType, PublishStatus } from "@prisma/client";

type RouteParams = {
  id: string;
  [key: string]: string;
};

type PatchBody = {
  title?: unknown;
  slug?: unknown;
  description?: unknown;
  content?: unknown;
  contentType?: unknown;
  metaTitle?: unknown;
  metaDescription?: unknown;
  status?: unknown;
};

function isString(v: unknown): v is string {
  return typeof v === "string";
}
function isContentType(v: unknown): v is ContentType {
  return typeof v === "string" && (Object.values(ContentType) as string[]).includes(v);
}
function isPublishStatus(v: unknown): v is PublishStatus {
  return typeof v === "string" && (Object.values(PublishStatus) as string[]).includes(v);
}

// GET
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<RouteParams> } // Next.js 15: params is a Promise
) {
  try {
    const { id } = await ctx.params;

    const page = await prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      return new NextResponse("Page not found", { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("[PAGE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PATCH
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

    // Build validated data object for Prisma using correct types
    const data: {
      title?: string;
      slug?: string;
      description?: string;
      content?: string;
      contentType?: ContentType;
      metaTitle?: string;
      metaDescription?: string;
      status?: PublishStatus;
      publishedAt?: Date;
    } = {};

    if ("title" in body && isString(body.title)) data.title = body.title;
    if ("slug" in body && isString(body.slug)) data.slug = body.slug;
    if ("description" in body && isString(body.description)) data.description = body.description;
    if ("content" in body && isString(body.content)) data.content = body.content;

    if ("contentType" in body) {
      if (isContentType(body.contentType)) {
        data.contentType = body.contentType;
      } else {
        return new NextResponse("Invalid contentType", { status: 400 });
      }
    }

    if ("metaTitle" in body && isString(body.metaTitle)) data.metaTitle = body.metaTitle;
    if ("metaDescription" in body && isString(body.metaDescription)) data.metaDescription = body.metaDescription;

    if ("status" in body) {
      if (isPublishStatus(body.status)) {
        data.status = body.status;
        // If status becomes PUBLISHED, set publishedAt now
        if (body.status === PublishStatus.PUBLISHED) {
          data.publishedAt = new Date();
        }
      } else {
        return new NextResponse("Invalid status value", { status: 400 });
      }
    }

    // Remove undefined keys so Prisma won't try to set them
    for (const key of Object.keys(data) as Array<keyof typeof data>) {
      if (data[key] === undefined) {
        delete data[key];
      }
    }

    if (Object.keys(data).length === 0) {
      return new NextResponse("No valid fields to update", { status: 400 });
    }

    const page = await prisma.page.update({
      where: { id },
      data,
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("[PAGE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE
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

    await prisma.page.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PAGE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
