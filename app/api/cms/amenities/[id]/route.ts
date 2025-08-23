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

    // Optional: enforce admin access to the business unit (recommended)
    const hasAdminAccess = session.user.assignments.some(
      (assignment) =>
        assignment.businessUnitId === businessUnitId &&
        assignment.role?.name === "Admin"
    );

    if (!hasAdminAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Ensure the amenity exists and belongs to the requested business unit
    const amenity = await prisma.amenity.findFirst({
      where: { id, businessUnitId },
      select: { id: true },
    });

    if (!amenity) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Delete by unique id
    await prisma.amenity.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[AMENITY_DELETE]", error);
    // In development you might want to re-throw to get full stack traces:
    // if (process.env.NODE_ENV === "development") throw error;
    return new NextResponse("Internal error", { status: 500 });
  }
}
