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
    // Uncomment if you want to require Admin role to delete content items.
    /*
    const hasAdminAccess = session.user.assignments.some(
      (assignment) =>
        assignment.businessUnitId === businessUnitId &&
        assignment.role?.name === "Admin"
    );

    if (!hasAdminAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    */

    // Use deleteMany with both fields in the where clause.
    // deleteMany supports non-unique where clauses and returns the count.
    const result = await prisma.contentItem.deleteMany({
      where: { id, businessUnitId },
    });

    if (result.count === 0) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CONTENT_ITEM_DELETE]", error);
    // In development you may want to rethrow to see the stack trace
    // if (process.env.NODE_ENV === "development") throw error;
    return new NextResponse("Internal error", { status: 500 });
  }
}
