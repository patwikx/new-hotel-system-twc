import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserStatus } from "@prisma/client";

// Define the explicit type for the params object
// Adding an index signature to resolve the Next.js type-checking issue
type RouteParams = {
  businessUnitId: string;
  userId: string;
  [key: string]: string;
};

type PatchBody = {
  isActive: boolean;
};

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<RouteParams> } // 👈 Next.js 15: params is a Promise
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { businessUnitId, userId } = await ctx.params; // 👈 await the params

    // Check if user has admin access to this business unit
    const hasAdminAccess = session.user.assignments.some(
      (assignment) =>
        assignment.businessUnitId === businessUnitId &&
        assignment.role.name === "Admin"
    );

    if (!hasAdminAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body: unknown = await req.json();
    if (
      typeof body !== "object" ||
      body === null ||
      typeof (body as PatchBody).isActive !== "boolean"
    ) {
      return new NextResponse("Invalid status value", { status: 400 });
    }

    const { isActive } = body as PatchBody;

    // Determine the new status based on the isActive boolean
    const newStatus: UserStatus = isActive ? "ACTIVE" : "INACTIVE";

    // Prevent self-deactivation by checking if the new status is INACTIVE
    if (session.user.id === userId && newStatus === "INACTIVE") {
      return new NextResponse("Cannot deactivate your own account", {
        status: 400,
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
      include: {
        assignments: {
          include: {
            businessUnit: { select: { id: true, name: true } },
            role: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    // Re-throw the error to ensure it's logged in a development environment
    if (process.env.NODE_ENV === "development") {
      throw error;
    }
    console.error("[USER_STATUS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
