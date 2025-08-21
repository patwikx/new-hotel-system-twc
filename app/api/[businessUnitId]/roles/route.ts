import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // The authorization logic below is correct and doesn't need changes.
    const businessUnitId = req.headers.get("x-business-unit-id");
    if (!businessUnitId) {
      return new NextResponse("Missing x-business-unit-id header", {
        status: 400,
      });
    }

    const hasAccess = session.user.assignments.some(
      (assignment) => assignment.businessUnitId === businessUnitId
    );
    if (!hasAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // --- START OF FIX ---
    // 1. Use 'prisma.role' instead of 'prisma.roles'
    // 2. Order by 'displayName' instead of 'role'
    const roles = await prisma.role.findMany({
      orderBy: {
        displayName: 'asc'
      }
    });
    // --- END OF FIX ---

    return NextResponse.json(roles);
  } catch (error) {
    console.error("[ROLES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}