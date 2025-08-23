import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  id: string;
  [key: string]: string;
};

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

    // Use deleteMany so we can filter by both id and businessUnitId (non-unique composite)
    const result = await prisma.testimonial.deleteMany({
      where: { id, businessUnitId },
    });

    if (result.count === 0) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TESTIMONIAL_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
